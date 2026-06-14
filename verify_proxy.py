from app import app

# Simulate a request behind Railway's reverse proxy
with app.test_request_context(
    '/auth/google/callback',
    headers={
        'X-Forwarded-Proto': 'https',
        'Host': 'web-production-a54fb7.up.railway.app',
        'X-Forwarded-For': '1.2.3.4'
    }
):
    from flask import url_for
    callback_url = url_for('google_callback', _external=True)
    print(f"Generated callback URL (with Host header): {callback_url}")

# With X-Forwarded-Host instead
with app.test_request_context(
    '/auth/google/callback',
    headers={
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': 'web-production-a54fb7.up.railway.app',
        'X-Forwarded-For': '1.2.3.4'
    }
):
    from flask import url_for
    callback_url = url_for('google_callback', _external=True)
    print(f"Generated callback URL (with X-Forwarded-Host header): {callback_url}")
