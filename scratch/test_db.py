from app import app, db, User
with app.app_context():
    u = User.query.filter_by(email='syednazeer2007s@gmail.com').first()
    if u:
        print(f'User found: verified={u.email_verified}, has_pw={bool(u.password_hash)}, reset_token={u.password_reset_token}')
    else:
        print('User not found')
