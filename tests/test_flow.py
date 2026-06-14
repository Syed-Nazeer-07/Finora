import pytest
from werkzeug.security import generate_password_hash
from app import app, db, User, Profile

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["WTF_CSRF_ENABLED"] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
            
            user = User(
                email="flow@example.com",
                name="Flow User",
                email_verified=True,
                password_hash=generate_password_hash("password123")
            )
            db.session.add(user)
            db.session.commit()
            
            # Setup default profile
            profile = Profile(user_id=user.id, account_mode="income")
            db.session.add(profile)
            db.session.commit()
            
        yield client
        
        with app.app_context():
            db.session.remove()
            db.drop_all()

def test_financial_mode_switch(client):
    # Log in
    client.post('/api/auth/login', json={
        'email': 'flow@example.com',
        'password': 'password123'
    })
    
    rv = client.put('/api/profile', json={
        'account_mode': 'cashflow',
        'current_savings': '5000',      # Emulate string payload
        'current_investments': '1000'
    })
    assert rv.status_code == 200
    
    rv_get = client.get('/api/profile')
    json_data = rv_get.get_json()
    assert json_data['account_mode'] == 'cashflow'
    assert json_data['current_savings'] == 5000.0   # Should be float
    assert json_data['current_investments'] == 1000.0

def test_transaction_mathematics(client):
    # Log in
    client.post('/api/auth/login', json={
        'email': 'flow@example.com',
        'password': 'password123'
    })
    
    # Create income
    rv = client.post('/api/transactions', json={
        'description': 'Salary',
        'amount': '10000',
        'date': '2025-01-01',
        'type': 'income',
        'category': 'Salary'
    })
    assert rv.status_code == 201
    
    # Create expense
    rv = client.post('/api/transactions', json={
        'description': 'Rent',
        'amount': '3000',
        'date': '2025-01-02',
        'type': 'expense',
        'category': 'Rent'
    })
    assert rv.status_code == 201
    
    # The actual calculation logic sits on frontend in JS, 
    # but we verify the API correctly returned pure float values.
    rv = client.get('/api/transactions')
    txs = rv.get_json()
    assert len(txs) == 2
    assert type(txs[0]['amount']) == float
    assert type(txs[1]['amount']) == float
