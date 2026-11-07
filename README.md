<div align="center">

# 💰 Finora
### Personal Finance Operating System

**Understand your money. Track your progress. Build better financial habits.**

A full-stack personal finance application built with Flask, SQLAlchemy, and PostgreSQL as my **CS50 Final Project**.

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)

[Features](#-features) · [Tech Stack](#-technology-stack) · [Architecture](#-project-structure) · [Getting Started](#-getting-started) · [Roadmap](#-future-improvements)

</div>

---

> 🌐 **Live application:** [Open Finora](https://finora-syed-nazeer-ss-projects.vercel.app) — hosted on Vercel with a connected Neon PostgreSQL database. Public login page and database health check have been verified (**HTTP 200**). Core API validations and account isolation are tested, but a complete hosted signup, email delivery, and logged-in data-persistence journey still need verification.

## 📌 Overview

Finora is a full-stack personal finance management web application designed to help people understand, organize, and improve their financial lives from one place.

Instead of scattering financial information across spreadsheets, notes, and separate tools, Finora brings together transaction tracking, budgeting, savings goals, investment records, and financial health insights in a unified dashboard.

Built as my **CS50 Final Project**, Finora applies core concepts in web development, relational database design, authentication, backend architecture, API integration, and deployment to a practical application.

## 🎯 The Problem

Managing personal finances can be difficult when income, expenses, budgets, savings, and goals are tracked separately. This can make it harder to understand spending habits, stay within limits, or measure progress toward financial goals.

Finora addresses this problem by centralizing financial activity and presenting useful summaries and progress indicators in a clear, approachable interface.

## ✨ Features

### 📊 Financial Dashboard
Get a consolidated overview of your financial position, including:
- Total balance and savings
- Monthly income and expenses
- Net worth
- Spending summaries
- Budget progress
- Financial health indicators

### 💳 Transaction Management
Organize financial activity in one place:
- Add, edit, and delete transactions
- Record income and expenses
- Track savings contributions
- Record investment entries
- Categorize transactions for reporting and analysis

### 🧾 Budget Tracking
Create category-based budgets and compare spending with planned limits. Example categories include food, transportation, entertainment, education, and utilities.

### 🎯 Savings Goals
Set financial targets and follow progress over time. Goals can represent an emergency fund, a laptop purchase, travel, or education expenses. Progress indicators help show how much has been saved and what remains.

### 📈 Investment Tracking
Record investments and asset values to help understand how investment holdings contribute to overall net worth.

### 🩺 Financial Health Analysis
Review indicators related to:
- Savings behavior
- Spending patterns
- Cash flow
- Goal progress
- Budget adherence

These indicators provide a consolidated view of financial habits. They are intended as informational summaries, not professional financial advice.

### 🔐 Authentication and Account Protection
- Email and password authentication
- Google OAuth sign-in
- Session-based user management
- Protected routes
- User-specific financial data access

## 🧭 How to Use Finora

1. Sign in with Google or a verified email account, then complete the onboarding profile.
2. Add income and expenses from **Transactions**. Use search and categories to review records.
3. Create monthly spending limits under **Budgets & Alerts** and track their progress.
4. Set savings targets in **Goal Forecasting** and record investment holdings in **Portfolio**.
5. Use **Dashboard** to review your balance, budgets, goals and charts; change preferences under **Settings**.

The dashboard deliberately keeps all core cards available, while the **This Month** and **Smart Insights** overview duplicates have been removed to reduce clutter. These changes do not remove underlying features.

## 🧰 Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript, Tailwind CSS, Chart.js, Lucide | Responsive interface and visualizations |
| **Backend** | Python 3.12, Flask | Routing, validation and business logic |
| **Database / ORM** | PostgreSQL, SQLite, SQLAlchemy | Financial records and relationships |
| **Authentication** | Password hashing, Flask sessions, Google OAuth (Authlib) | Sign-in and account protection |
| **Email** | Resend API or encrypted SMTP | Verification and password recovery |
| **Hosting** | Vercel (Flask Functions) and external PostgreSQL (e.g. Neon) | Deployment and durable storage |
| **Testing** | pytest, Flask test client | API, financial and security regressions |

## 🏗️ Project Structure

The repository keeps Flask routes and SQLAlchemy models together while separating templates, assets and frontend JavaScript.

```text
Finora/
├── app.py                      # Flask app, models, auth and APIs
├── requirements.txt            # Backend dependencies
├── .env.example                # Environment variable template
├── pytest.ini                  # Test configuration
├── templates/                  # Authentication, onboarding and app pages
├── static/
│   ├── css/style.css
│   ├── js/                     # Dashboard, charts, transactions and UI
│   ├── branding/               # Logos referenced by the UI
│   └── ...                     # Favicons and manifest
└── tests/                      # Backend and security tests
```

### Architectural Responsibilities

- **`app.py`** — initializes Flask, configures SQLAlchemy and defines models, routes and financial APIs.
- **`templates/`** — holds login, recovery, onboarding and dashboard pages.
- **`static/js/`** — handles UI state, calculations, charts and transaction workflows.
- **`tests/`** — verifies core authentication, data isolation, email and financial behavior.

*Finora is a Flask + vanilla JavaScript app. It does **not** use React/Vite, Flask Blueprints, or a separate `frontend/` folder.*

## 🚀 Getting Started

### Prerequisites

- Python **3.12** (recommended)
- Git and pip
- SQLite for local development or PostgreSQL for persistent hosting

### 1. Clone the Repository

```bash
git clone https://github.com/Syed-Nazeer-07/Finora.git
cd Finora
```

### 2. Create and Activate a Virtual Environment

**Windows (PowerShell)**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to a local `.env` and generate a secure `SECRET_KEY`. SQLite works locally.

- **Google login (optional):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **Email verification / reset:** use Resend (`RESEND_API_KEY`, `EMAIL_FROM`) **or** encrypted SMTP (`MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`).
- **Production database:** set `DATABASE_URL` to a real PostgreSQL connection string.

**Never commit secrets or a real `.env` file.**

### 5. Run Locally

```bash
flask --app app run --debug
```

Open **http://127.0.0.1:5000/login**.

The app creates missing tables with SQLAlchemy `create_all()`. This is **not** a database migration system; existing schema changes require a reviewed migration.

### 6. Deploy with Vercel + PostgreSQL

1. Import the GitHub repository into **Vercel**. Select **Flask** and set **Root Directory** to the repository root, not `frontend`.
2. Create and connect a durable PostgreSQL database, for example **Neon Free**. Confirm `DATABASE_URL` is assigned to Vercel's **Production** environment. The current hosted Finora project has this configured.
3. Set `SECRET_KEY`, `PREFERRED_URL_SCHEME=https` and `FLASK_ENV=production`.
4. Configure an email provider. For Google OAuth, register `https://YOUR_DOMAIN/auth/google/callback` as an authorized redirect URI.
5. Redeploy and check `/health` — a correctly connected database returns HTTP **200**, with `{"status":"healthy","database":"connected"}`.
6. Verify the complete signup → verification → login → transaction → logout flow, including persistence after a new deployment.

> **Important:** A Vercel build marked **READY** does not mean the application is fully operational. Without `DATABASE_URL`, Finora deliberately returns HTTP **503** for database-backed routes rather than risking data loss in temporary SQLite storage.

*Free plans have usage limits and are intended here for a small personal/educational deployment.*

## 🔒 Security Notes

Finora handles personal financial records, so security and data isolation are essential.

- Keep account credentials, email keys, and database secrets outside version control.
- Use HTTPS, secure session cookies, password hashing and ownership checks.
- Validate transactions, financial values and dates; investment sales update holdings and ledger entries atomically.
- **Before wider public use:** expand CSRF protection, rate limiting, database migrations and monitoring.

Financial health indicators and historical net-worth charts are estimates, not verified statements of account balances.

## 🧠 Design Decisions

- **Flask:** Simple backend for server-rendered pages, JSON APIs and authentication.
- **SQLAlchemy:** Relational models for users, transactions, budgets, goals and investments.
- **PostgreSQL in production:** Durable storage for financial records.
- **SQLite in development:** Easy local setup, but not durable in Vercel Functions.
- **JavaScript + Tailwind CSS:** A responsive interface without an additional frontend framework.
- **Vercel + Neon:** A practical free-tier option for a personal portfolio, subject to quotas.

## 🧩 Challenges and Lessons Learned

Building Finora provided hands-on experience with several full-stack engineering concerns:

- Designing a financial dashboard that makes key metrics easy to understand
- Modeling relationships between users and financial records
- Integrating Google OAuth with application authentication
- Keeping financial calculations consistent across the application
- Configuring production databases, environment variables, and deployment settings
- Troubleshooting hosting, deployment protection and HTTPS settings
- Debugging differences between local and production environments



## 🎓 What I Learned

Finora brought together concepts from CS50 and extended them into a complete application. The project strengthened my understanding of:

- Full-stack web development with Python and Flask
- Relational database design and ORM usage
- Authentication and session management
- API and OAuth integration
- Separating Flask backend logic, HTML templates, and client-side modules
- UI/UX design and responsive interfaces
- Cloud deployment, configuration, and production debugging

## 🧪 Testing & Verification

The repository includes tests for authentication, transactions, financial validation, investment sales, email transport and cross-account isolation.

- ✅ **41 Python tests passed** on November 7, 2026, including same-origin request protection and verification-email UI states.
- ✅ **11 JavaScript UI tests passed**, covering dashboard sections, empty states and single Add/Create actions.
- ✅ All 8 Jinja templates compile, static-file references resolve and frontend API URLs match backend routes.
- ✅ Frontend JavaScript syntax checks passed.
- ✅ Production Flask, PostgreSQL health check, login page, static assets, API authentication barriers, and cross-origin protection were verified on the public domain.
- 🔶 Real email delivery, a complete independently replayed OAuth/login journey, and logged-in data persistence across deployments still require live end-to-end testing.

Run both suites locally:

```bash
python -m pip install pytest
python -m pytest -q
node --test tests/*.test.cjs
```

**Node.js is needed only to run the frontend tests**, not to serve the Flask app. There is currently no active GitHub Actions workflow; verification runs must be executed manually.

## 🚀 Future Improvements

- Verify hosted signup, email verification, Google OAuth and financial data persistence across deployments.
- Add versioned database migrations and automatic CI.
- Improve CSRF protection, rate limiting and monitoring.
- Extend historical net-worth snapshots and financial calculation accuracy.
- Polish accessibility and the production frontend asset build; replace unpinned development CDNs with version-controlled assets.

---

## ⚠️ Disclaimer

Finora is an educational financial-tracking project. Its analyses are informational and should not be treated as professional financial, investment, tax or legal advice.

## 👨‍💻 Author

**Syed Nazeer S**

- GitHub: [@Syed-Nazeer-07](https://github.com/Syed-Nazeer-07)
- Project repository: [Finora](https://github.com/Syed-Nazeer-07/Finora)
- Live app: [Finora on Vercel](https://finora-syed-nazeer-ss-projects.vercel.app) (Neon PostgreSQL connected)

---

<div align="center">

**Built with 💚 as my CS50 Final Project**

If you find the project interesting, feel free to explore the repository.

</div>
