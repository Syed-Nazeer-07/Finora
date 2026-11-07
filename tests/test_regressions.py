"""Regression coverage for financial input validation and authenticated data isolation."""
import pytest
from werkzeug.security import generate_password_hash
from app import app, db, User, Profile


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.app_context():
        db.create_all()
        user = User.query.filter_by(email="finora-regression@example.invalid").first()
        if not user:
            user = User(name="Regression", email="finora-regression@example.invalid",
                        email_verified=True, password_hash=generate_password_hash("Testing123"))
            db.session.add(user)
            db.session.flush()
            db.session.add(Profile(user_id=user.id))
            db.session.commit()
    with app.test_client() as client:
        client.post("/api/auth/login", json={"email": "finora-regression@example.invalid", "password": "Testing123"})
        yield client
    with app.app_context():
        user = User.query.filter_by(email="finora-regression@example.invalid").first()
        if user:
            db.session.delete(user)
            db.session.commit()


@pytest.mark.parametrize("amount", [-1, 0, "NaN", "Infinity", "not-a-number"])
def test_reject_invalid_transaction_amounts(client, amount):
    response = client.post("/api/transactions", json={
        "description": "Rejected", "amount": amount, "date": "2026-11-07",
        "type": "expense", "category": "Groceries"
    })
    assert response.status_code == 400


@pytest.mark.parametrize("date_value", ["2026-02-30", "2026-13-01", "not-a-date"])
def test_reject_invalid_transaction_dates(client, date_value):
    response = client.post("/api/transactions", json={
        "description": "Rejected", "amount": 10, "date": date_value,
        "type": "expense", "category": "Groceries"
    })
    assert response.status_code == 400


@pytest.mark.parametrize("endpoint,payload", [
    ("/api/budgets", {"category": "Food", "limit": -10}),
    ("/api/budgets", {"category": "Food", "limit": "NaN"}),
    ("/api/goals", {"name": "Laptop", "target": 0}),
    ("/api/goals", {"name": "Laptop", "target": 500, "current": -1}),
    ("/api/investments", {"symbol": "TEST", "shares": -4}),
    ("/api/investments", {"symbol": "TEST", "shares": "Infinity"}),
])
def test_reject_invalid_financial_numbers(client, endpoint, payload):
    assert client.post(endpoint, json=payload).status_code == 400


def test_no_public_debug_endpoints(client):
    assert client.get("/debug/oauth").status_code == 404
    assert client.get("/api/admin/test-smtp").status_code == 404


def test_valid_transaction_round_trip(client):
    payload = {"description": "Sample", "amount": 12.5, "date": "2026-11-07",
               "type": "expense", "category": "Groceries"}
    response = client.post("/api/transactions", json=payload)
    assert response.status_code == 201
    txid = response.get_json()["id"]
    assert response.get_json()["amount"] == 12.5
    assert client.delete(f"/api/transactions/{txid}").status_code == 200
