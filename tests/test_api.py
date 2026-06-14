import pytest
import os
from werkzeug.security import generate_password_hash
from app import app, db, User, Profile, Category

@pytest.fixture
def client():
    # Configure app for testing
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["WTF_CSRF_ENABLED"] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            
            # Create a test user
            user = User(
                email="test@example.com",
                name="Test User",
                email_verified=True,
                password_hash=generate_password_hash("password123")
            )
            db.session.add(user)
            db.session.commit()
            
        yield client
        
        with app.app_context():
            db.session.remove()
            db.drop_all()

def test_login(client):
    rv = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert 'id' in json_data and json_data['email'] == 'test@example.com'

def test_create_category_requires_auth(client):
    rv = client.post('/api/categories', json={
        'name': 'Test Category',
        'category_type': 'expense'
    })
    # Should be 401 Unauthorized because we aren't logged in
    assert rv.status_code == 401

def test_authenticated_category_creation(client):
    # Log in first
    client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Now create category
    rv = client.post('/api/categories', json={
        'name': 'Test Category',
        'category_type': 'expense',
        'emoji': '🚀',
        'color': '#ff0000'
    })
    assert rv.status_code == 201
    json_data = rv.get_json()
    assert json_data['name'] == 'Test Category'
