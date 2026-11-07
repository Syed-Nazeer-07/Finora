"""Verify that one signed-in account cannot modify another account's data."""
import pytest
from werkzeug.security import generate_password_hash

from app import app, db, User, Profile, Transaction, Budget, Goal, Investment


@pytest.fixture
def isolated_accounts():
    app.config["TESTING"] = True
    emails = ("finora-owner-iso@example.invalid", "finora-other-iso@example.invalid")
    with app.app_context():
        db.create_all()
        users = []
        for number, email in enumerate(emails):
            user = User(
                name=f"Isolation {number}",
                email=email,
                email_verified=True,
                password_hash=generate_password_hash("Testing123"),
            )
            db.session.add(user)
            db.session.flush()
            db.session.add(Profile(user_id=user.id))
            users.append(user.id)
        db.session.commit()

    with app.test_client() as owner, app.test_client() as other:
        assert owner.post("/api/auth/login", json={
            "email": emails[0], "password": "Testing123",
        }).status_code == 200
        assert other.post("/api/auth/login", json={
            "email": emails[1], "password": "Testing123",
        }).status_code == 200
        yield owner, other, users

    with app.app_context():
        for uid in users:
            user = db.session.get(User, uid)
            if user is not None:
                db.session.delete(user)
        db.session.commit()
        db.session.remove()


def test_account_records_cannot_be_read_or_modified_cross_user(isolated_accounts):
    owner, other, _ = isolated_accounts
    transaction = owner.post("/api/transactions", json={
        "description": "Private transaction", "amount": 150,
        "category": "Groceries", "type": "expense", "date": "2026-11-07",
    })
    budget = owner.post("/api/budgets", json={
        "category": "Groceries", "limit": 300,
    })
    goal = owner.post("/api/goals", json={
        "name": "Savings", "target": 1500,
    })
    investment = owner.post("/api/investments", json={
        "symbol": "PRIV", "type": "Stock", "shares": 5,
        "avgCost": 100, "currentPrice": 110,
    })
    for response in (transaction, budget, goal, investment):
        assert response.status_code == 201, response.get_data(as_text=True)

    tx_id = transaction.get_json()["id"]
    budget_id = budget.get_json()["id"]
    goal_id = goal.get_json()["id"]
    investment_id = investment.get_json()["id"]

    for resource in ("transactions", "budgets", "goals", "investments"):
        response = other.get(f"/api/{resource}")
        assert response.status_code == 200
        assert response.get_json() == []

    assert other.delete(f"/api/transactions/{tx_id}").status_code == 404
    assert other.delete(f"/api/budgets/{budget_id}").status_code == 404
    assert other.delete(f"/api/goals/{goal_id}").status_code == 404
    assert other.delete(f"/api/investments/{investment_id}").status_code == 404
    assert other.post(f"/api/investments/{investment_id}/sell", json={
        "shares": 2, "price": 120, "date": "2026-11-07",
    }).status_code == 404

    # An unauthorized attempt must leave every owner's record intact.
    assert len(owner.get("/api/transactions").get_json()) == 1
    assert len(owner.get("/api/budgets").get_json()) == 1
    assert len(owner.get("/api/goals").get_json()) == 1
    assert len(owner.get("/api/investments").get_json()) == 1


def test_missing_database_serverless_health_and_api(monkeypatch):
    import app as app_module
    monkeypatch.setattr(app_module, "database_unavailable", True)
    with app.test_client() as client:
        assert client.get("/login").status_code == 200
        health = client.get("/health")
        assert health.status_code == 503
        assert health.get_json()["database"] == "not_configured"
        assert client.get("/api/auth/me").status_code == 503
        assert client.post("/api/auth/signup", json={
            "name": "No DB", "email": "blocked@example.invalid", "password": "Password123",
        }).status_code == 503
