"""Defend session-backed APIs against cross-origin browser mutations."""
import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


@pytest.mark.parametrize("headers", [
    {"Origin": "https://malicious.example"},
    {"Origin": "null"},
    {"Sec-Fetch-Site": "cross-site"},
    {"Sec-Fetch-Site": "same-site"},
    {"Origin": "http://localhost.evil.example"},
])
def test_cross_origin_browser_mutations_rejected(client, headers):
    response = client.post("/api/auth/logout", json={}, headers=headers)
    assert response.status_code == 403


def test_same_origin_mutations_allowed(client):
    response = client.post(
        "/api/auth/logout", json={},
        headers={"Origin": "http://localhost", "Sec-Fetch-Site": "same-origin"},
    )
    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_public_login_page_unaffected(client):
    response = client.get("/login", headers={"Sec-Fetch-Site": "cross-site"})
    assert response.status_code == 200
