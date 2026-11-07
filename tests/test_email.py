"""Email transport tests: do not send real messages."""
import os
from unittest.mock import MagicMock, patch

import pytest
import resend

from app import app, _send_email


@pytest.mark.parametrize("port,transport", [("465", "SMTP_SSL"), ("587", "SMTP")])
def test_smtp_fallback_sends_verification_email(port, transport):
    smtp = MagicMock()
    smtp_class = MagicMock()
    smtp_class.return_value.__enter__.return_value = smtp
    settings = {
        "MAIL_SERVER": "smtp.example.invalid",
        "MAIL_PORT": port,
        "MAIL_USERNAME": "finora@example.invalid",
        "MAIL_PASSWORD": "test-only-password",
    }
    with patch.dict(os.environ, settings), patch.object(resend, "api_key", ""), \
         patch("smtplib." + transport, smtp_class), app.test_request_context("/"):
        assert _send_email("recipient@example.invalid", "Verify Finora", "<b>Hello</b>")
    assert smtp.login.call_count == 1
    smtp.send_message.assert_called_once()
    if port == "587":
        smtp.starttls.assert_called_once()


def test_unconfigured_email_returns_false():
    with patch.dict(os.environ, {
        "MAIL_SERVER": "", "MAIL_USERNAME": "", "MAIL_PASSWORD": ""
    }), patch.object(resend, "api_key", ""), app.test_request_context("/"):
        assert _send_email("recipient@example.invalid", "Verify", "<b>Hello</b>") is False


def test_resend_has_priority_over_smtp():
    with patch.object(resend, "api_key", "fake-testing-key"), \
         patch.object(resend.Emails, "send", return_value={"id": "email_test"}), \
         app.test_request_context("/"):
        assert _send_email("recipient@example.invalid", "Verify", "<b>Hello</b>") is True
