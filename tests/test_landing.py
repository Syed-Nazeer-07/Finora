"""Public marketing landing and signed-in dashboard route smoke checks."""
from app import app


def test_anonymous_home_renders_marketing_page():
    with app.test_client() as client:
        response = client.get("/")
    assert response.status_code == 200
    assert b"Make sense" in response.data
    assert b"SAMPLE DATA" in response.data
    assert b"/login" in response.data


def test_signed_in_home_retains_dashboard():
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess["user_id"] = 12345
        response = client.get("/")
    assert response.status_code == 200
    assert b'id="sidebar"' in response.data
