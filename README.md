<div align="center">

# Finora
### Personal Finance OS

**Track your spending. Plan your goals. Understand your finances.**

A full-stack personal finance web application built with **Python, Flask, and SQLAlchemy** as a **Harvard CS50x final project**.

[Features](#features) · [Tech stack](#tech-stack) · [Project structure](#project-structure) · [Run locally](#run-locally) · [Deploy](#deploy-with-vercel-and-postgresql) · [Tests](#tests)

</div>

---

> **Deployment status — November 2026:** The Flask application builds on Vercel, and the login page and static files load. **The hosted app is not yet ready for real financial data:** the Vercel project still needs a persistent PostgreSQL `DATABASE_URL`. Until that is configured, `/health` returns HTTP 503 and database-backed APIs are deliberately unavailable. The former `finoraweb.online` demo is not currently active. A successful Vercel build does not mean signup or data storage is working.

## About Finora

Finora brings transactions, monthly budgets, savings goals, investment holdings, and financial summaries into one interface. It was created to apply computer-science fundamentals to a practical financial-tracking application, with attention to usability, server-side data ownership, and reliable calculations.

This is an educational portfolio project, **not a banking platform or financial-advice service**.

## Features

- **Dashboard:** view balances, monthly income/expenses, spending breakdowns, budget progress, charts, and indicative financial-health metrics.
- **Transactions:** create, edit, delete, and categorize income and expenses; filter records and export transaction data.
- **Monthly budgets:** set category limits and compare them with spending in the current month.
- **Savings goals:** set targets, monitor progress, record contributions, and view estimated completion timelines.
- **Investment tracker:** record holdings and prices. The investment-sale flow updates holdings and financial ledger entries in one database transaction.
- **Personalization:** onboarding, user settings, appearance preferences, currency display, and category management.
- **Authentication:** password login, email verification, reset-password flow, and optional Google OAuth sign-in.
- **Account isolation:** users' transactions, budgets, goals, and investments are scoped to their accounts.

**Calculation note:** Financial health scores, forecasts, and net-worth charts are estimates; some historical accounting metrics still need more complete asset/liability snapshots before they should be treated as authoritative.

## Tech stack

| Area | Stack |
|---|---|
| Backend | Python 3.12, Flask |
| Database | SQLAlchemy; PostgreSQL for persistent hosting, SQLite for local development |
| Authentication | Werkzeug password hashing, Flask sessions, Google OAuth (Authlib) |
| Frontend | Jinja/HTML, JavaScript, CSS, Tailwind CSS (CDN) |
| Charts and icons | Chart.js, Lucide |
| Transactional email | Resend API or encrypted SMTP fallback |
| Hosting | Vercel Flask Functions; external PostgreSQL provider (Neon is an option) |
| Tests | pytest, Flask test client |

The UI uses plain JavaScript and server-rendered templates; there is **no React/Vite frontend build**. The application currently keeps its Flask routes and SQLAlchemy models together in `app.py`; it does not yet have separate `models/` or `services/` packages.

## Project structure

```text
Finora/
├── app.py                    # Flask app, models, auth, APIs and health check
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable names; no real secrets
├── pytest.ini
├── templates/                # Login, onboarding, dashboard and account pages
├── static/
│   ├── js/                   # Dashboard, transactions, charts and UI logic
│   ├── css/style.css
│   ├── branding/             # Logos referenced by the UI
│   └── ...                   # Icons and web app manifest
└── tests/                    # API, auth, email, finance and isolation tests
```

## Run locally

**Requirements:** Git and Python 3.12 (recommended). A PostgreSQL server is optional for local development; SQLite works locally.

1. Clone the repository:

   ```bash
   git clone https://github.com/Syed-Nazeer-07/Finora.git
   cd Finora
   ```

2. Create a virtual environment:

   **Windows PowerShell**

   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **macOS / Linux**

   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

4. Create a local environment file from the supplied template:

   **Windows PowerShell:** `Copy-Item .env.example .env`

   **macOS / Linux:** `cp .env.example .env`

   Edit `.env` with a randomly generated `SECRET_KEY` (for example, generate one with `python -c "import secrets; print(secrets.token_hex(32))"`). The template enables a local SQLite database. **Never commit secrets or a real database connection string.**

5. Start Flask:

   ```bash
   flask --app app run --debug
   ```

   Open **http://127.0.0.1:5000/login**.

**Email verification:** Creating an account requires a working verification-email provider to complete password signup. Configure either `RESEND_API_KEY` and `EMAIL_FROM`, or `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD`. The app will report a failed send instead of claiming delivery when email is not configured. Google login requires its own OAuth client credentials.

## Deploy with Vercel and PostgreSQL

Finora uses a single Flask app, so it can run on Vercel without a separate frontend project.

1. Connect this repository to a **Vercel** project. Set **Framework Preset = Flask** and **Root Directory = repository root** (empty), *not* a nonexistent `frontend` directory. Leave build and output commands on automatic defaults.
2. Provision a **persistent PostgreSQL** database, for example Neon's Free plan, and connect it to the Finora Vercel project. Check that the integration exposes a usable `DATABASE_URL` in the **Production** environment.
3. In **Vercel → Project Settings → Environment Variables**, configure at least:
   - `DATABASE_URL` — full PostgreSQL connection URI (keep private)
   - `SECRET_KEY` — a secure random secret
   - `PREFERRED_URL_SCHEME=https`
   - `FLASK_ENV=production`
4. For password signups and password recovery, configure **one** supported email provider. Resend requires a valid API key and an approved sending identity; SMTP uses authenticated TLS on port 465 or 587.
5. For Google login, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` and register `https://YOUR_DEPLOYED_DOMAIN/auth/google/callback` as an authorized redirect URI.
6. Deploy the latest `main` commit and check `https://YOUR_DEPLOYED_DOMAIN/health`. A working installation responds with HTTP **200** and `{"status":"healthy","database":"connected"}`.
7. Before adding real data, verify signup → email verification → login → create/edit/delete transactions → logout → login again. Confirm data survives a new deployment and cannot be accessed from another user account.

**Without a configured persistent database**, Vercel intentionally serves public pages but returns HTTP **503** for database-backed routes. Never rely on local SQLite inside Vercel Functions for stored financial data: serverless filesystem changes are not durable.

**Database migrations:** The app currently uses SQLAlchemy `db.create_all()` to create missing tables at startup. This does **not** migrate existing schemas. Back up production data and implement versioned migrations before changing deployed models.

**Free hosting:** Vercel Hobby and Neon Free can suit a small personal/educational deployment within their usage limits. Check current quotas and terms directly with each provider; free hosting does not guarantee 24/7 availability or suitability for sensitive production workloads.

## Tests

Install pytest separately and run the suite:

```bash
python -m pip install pytest
python -m pytest -q
```

**Last independently executed suite (7 Nov 2026): 32 tests passed** using Python 3.12 in an isolated environment. Frontend JavaScript syntax checks also passed. The tests cover authentication, financial validation, transaction handling, investment-sale consistency, email transport with mocks, and cross-account record isolation.

These are **not** complete production end-to-end tests. Live email delivery, Google OAuth, the hosted PostgreSQL connection, mobile UI behavior, and persistence across deployments still require verification. There is no currently active GitHub Actions workflow.

## Security and limitations

- Never expose `SECRET_KEY`, Google OAuth secrets, email credentials, or `DATABASE_URL` in the browser or Git.
- Deploy behind HTTPS and use strong session secrets.
- Ownership checks and input validation are included, but CSRF defenses, rate limiting, and operational hardening should be strengthened before inviting public users.
- Financial values are informational and may require reconciliation with actual banking or brokerage records.
- Historical net-worth snapshots and database migrations remain engineering priorities.

## Author

**Syed Nazeer S** — Harvard CS50x Final Project

[GitHub profile](https://github.com/Syed-Nazeer-07) · [Finora repository](https://github.com/Syed-Nazeer-07/Finora)

---

*Finora is educational software, not financial, tax, legal, or investment advice.*
