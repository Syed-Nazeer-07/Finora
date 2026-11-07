"""Atomic investment sale regression tests."""
import pytest
from werkzeug.security import generate_password_hash
from app import app, db, User, Profile, Investment, Transaction


@pytest.fixture
def sale_client():
    app.config["TESTING"] = True
    with app.app_context():
        db.create_all()
        user = User(name="Sale Tester", email="finora-sale-test@example.invalid",
                    email_verified=True, password_hash=generate_password_hash("Testing123"))
        db.session.add(user)
        db.session.flush()
        db.session.add(Profile(user_id=user.id))
        inv = Investment(user_id=user.id, symbol="DEMO", asset_type="Stock",
                         quantity=10, average_cost=50, current_value=80)
        db.session.add(inv)
        db.session.commit()
        user_id, inv_id = user.id, inv.id
    with app.test_client() as client:
        client.post("/api/auth/login", json={
            "email": "finora-sale-test@example.invalid", "password": "Testing123"})
        yield client, user_id, inv_id
    with app.app_context():
        user = db.session.get(User, user_id)
        if user:
            db.session.delete(user)
            db.session.commit()


def test_partial_sale_updates_holdings_and_ledger(sale_client):
    client, user_id, inv_id = sale_client
    r = client.post(f"/api/investments/{inv_id}/sell",
                    json={"shares": 4, "price": 90, "date": "2026-11-07"})
    assert r.status_code == 200
    assert r.get_json()["realizedProfit"] == 160
    with app.app_context():
        investment = db.session.get(Investment, inv_id)
        assert investment.quantity == 6
        txs = Transaction.query.filter_by(user_id=user_id).all()
        assert sorted((t.type, t.amount) for t in txs) == [
            ("expense", 200.0), ("income", 360.0)]


def test_rejected_oversell_does_not_mutate_holdings(sale_client):
    client, user_id, inv_id = sale_client
    r = client.post(f"/api/investments/{inv_id}/sell",
                    json={"shares": 11, "price": 90, "date": "2026-11-07"})
    assert r.status_code == 400
    with app.app_context():
        assert db.session.get(Investment, inv_id).quantity == 10
        assert Transaction.query.filter_by(user_id=user_id).count() == 0


@pytest.mark.parametrize("payload", [
    {"shares": 0, "price": 90, "date": "2026-11-07"},
    {"shares": 2, "price": -1, "date": "2026-11-07"},
    {"shares": 2, "price": 90, "date": "2026-02-31"},
])
def test_rejected_invalid_sale_is_unchanged(sale_client, payload):
    client, user_id, inv_id = sale_client
    r = client.post(f"/api/investments/{inv_id}/sell", json=payload)
    assert r.status_code == 400
    with app.app_context():
        assert db.session.get(Investment, inv_id).quantity == 10
        assert Transaction.query.filter_by(user_id=user_id).count() == 0
