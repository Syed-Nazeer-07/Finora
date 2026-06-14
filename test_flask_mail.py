import os
from dotenv import load_dotenv
load_dotenv('.env')

from app import app, mail
from flask_mail import Message

with app.app_context():
    print("Testing Flask-Mail...")
    try:
        msg = Message(subject='Finora App Context Test', recipients=['syednazeer2007s@gmail.com'], body='This is sent using the app.py configuration directly.')
        mail.send(msg)
        print("Success! The app configuration is correct.")
    except Exception as e:
        print("Failed!", type(e).__name__, str(e))
