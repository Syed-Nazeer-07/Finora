<div align="center">

# 💰 Finora

### Personal finance, made clearer.

**Track your money. Understand your habits. Make progress toward your goals.**

A full-stack personal finance web application built as a **Harvard CS50x Final Project**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_Finora-16A34A?style=for-the-badge&logo=vercel&logoColor=white)](https://finora-syed-nazeer-ss-projects.vercel.app)
[![Source Code](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Syed-Nazeer-07/Finora)

<br>

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

**[Explore Features](#-what-you-can-do) · [Technology](#-tech-stack) · [Run Locally](#-getting-started) · [Deployment](#-deployment)**

</div>

---

## ✨ Overview

Finora brings everyday money management into one organized workspace. Instead of juggling spreadsheets and disconnected tools, users can record transactions, plan budgets, work toward savings goals, monitor investments, and explore their financial activity through a unified dashboard.

The project combines a **Flask backend**, **SQLAlchemy data models**, and a responsive **JavaScript-powered frontend**. It was developed to apply computer science fundamentals to a practical, end-to-end web application.

## 🚀 What You Can Do

| Feature | What it offers |
|:--|:--|
| **📊 Dashboard** | An at-a-glance view of balances, income, expenses, budgets, goals, and financial trends. |
| **💳 Transactions** | Add, edit, delete, search, and categorize income and expenses. |
| **🧾 Budgets** | Set spending limits by category and follow your progress throughout the month. |
| **🎯 Savings goals** | Create financial targets, record contributions, and visualize progress. |
| **📈 Investment portfolio** | Record holdings and track how investments contribute to your financial picture. |
| **🩺 Financial insights** | Review cash flow, spending patterns, savings behavior, and financial health indicators. |
| **🔐 Accounts & settings** | Sign in, manage your profile, and keep personal financial records associated with your account. |
| **📤 Data export** | Export transaction and financial records through dedicated backend endpoints. |

### Designed around the essentials

- **Clear navigation** across dashboard, transactions, budgets, goals, portfolio, and settings.
- **Focused summaries** that keep important information visible without duplicating dashboard cards.
- **Interactive charts and progress indicators** that make financial patterns easier to understand.
- **Responsive layouts** for working with financial data across screen sizes.

## 🧭 How Finora Works

1. **Create an account** and complete your profile.
2. **Add transactions** to build a picture of your income and spending.
3. **Set budgets** for categories you want to manage more carefully.
4. **Create savings goals** and record investment holdings as needed.
5. **Return to the dashboard** to review progress and financial insights.

> Finora is a personal finance **tracking and planning** application. It does not connect directly to bank accounts or execute financial trades.

## 🛠️ Tech Stack

| Layer | Technologies |
|:--|:--|
| **Frontend** | HTML5, CSS3, JavaScript, Tailwind CSS, Chart.js, Lucide |
| **Backend** | Python, Flask |
| **Database** | PostgreSQL (hosted), SQLite (local development) |
| **Data access** | Flask-SQLAlchemy, SQLAlchemy |
| **Authentication** | Password hashing, Flask sessions, Google OAuth via Authlib |
| **Email** | Resend API or SMTP for account verification and password recovery |
| **Schema tooling** | Flask-Migrate / Alembic |
| **Deployment** | Vercel, Neon PostgreSQL |
| **Testing** | pytest, Flask test client, Node.js test runner |

### Architecture

```text
Browser
  │
  ├── HTML templates + CSS + JavaScript
  │         │
  │         └── Interactive UI and charts
  │
  └── Flask application
            ├── Authentication and session handling
            ├── Financial APIs and business logic
            ├── SQLAlchemy models
            └── PostgreSQL / SQLite
```

Flask serves the application pages and API endpoints, while client-side JavaScript powers the dashboard and interactive workflows. Financial records are stored using relational models and accessed through account-scoped routes.

## 📁 Project Structure

```text
Finora/
├── app.py                 # Flask app, database models, routes and APIs
├── requirements.txt       # Python dependencies
├── .env.example           # Example environment configuration
├── pytest.ini             # pytest configuration
├── templates/             # Login, onboarding and application pages
├── static/
│   ├── css/               # Styling
│   ├── js/                # Interactivity, charts and workflows
│   └── branding/          # Brand assets
└── tests/                 # Backend and frontend tests
```

The project uses Flask with server-rendered templates and vanilla JavaScript; there is no separate React frontend.

## 💻 Getting Started

### Requirements

- Python 3.12 (recommended)
- Git and pip
- Node.js (optional, for frontend tests)

### 1. Clone the project

```bash
git clone https://github.com/Syed-Nazeer-07/Finora.git
cd Finora
```

### 2. Create a virtual environment

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

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure the environment

Copy `.env.example` to `.env`, then replace the placeholder `SECRET_KEY` with a secure random value.

For local development, the example configuration uses SQLite. Other optional integrations can be configured with environment variables:

| Variable | Purpose |
|:--|:--|
| `DATABASE_URL` | Database connection string; PostgreSQL for hosting |
| `SECRET_KEY` | Flask session signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `RESEND_API_KEY` / `EMAIL_FROM` | Verification and password-reset email |
| `MAIL_SERVER` / `MAIL_USERNAME` / `MAIL_PASSWORD` | Alternative SMTP email configuration |

Email-based signup and recovery require a working email provider. Never commit real credentials or your `.env` file.

### 5. Start the application

```bash
flask --app app run --debug
```

Open **http://127.0.0.1:5000/login** in your browser.

## ☁️ Deployment

Finora is set up for **Vercel** hosting with a **PostgreSQL database** such as Neon.

For your own deployment:

1. Import the repository into Vercel and use the repository root.
2. Provision PostgreSQL and set `DATABASE_URL` in the hosting environment.
3. Set a secure `SECRET_KEY`, `FLASK_ENV=production`, and `PREFERRED_URL_SCHEME=https`.
4. Configure your email provider and optional Google OAuth callback URL.
5. Deploy the application and test the account and financial workflows with your own configuration.

**Why PostgreSQL?** Serverless deployments should use durable external storage rather than relying on a temporary local SQLite file.

**Live demo:** [finora-syed-nazeer-ss-projects.vercel.app](https://finora-syed-nazeer-ss-projects.vercel.app)

## 🧪 Testing

The repository includes automated tests covering authentication, financial operations, input validation, and account-level data isolation.

**Backend tests**

```bash
python -m pytest -q
```

**Frontend tests** (requires Node.js)

```bash
node --test tests/*.test.cjs
```

These test commands are intended for a local development environment. Test coverage and deployment status can evolve independently of the README.

## 🔒 Security & Data

Finora uses account-scoped financial APIs, password hashing, session-based authentication, and environment-based secret configuration. Financial records and inputs are validated by backend logic.

If deploying your own instance, use HTTPS, protect environment secrets, maintain database backups, and review authentication and security controls before handling sensitive real-world data.

## 🗺️ What's Next

Areas for continued development include recurring transactions, more detailed historical financial reports, enhanced budget alerts, accessibility improvements, and automated continuous integration.

## 🎓 About the Project

Finora was created as a **Harvard CS50x Final Project** and expanded into a portfolio project exploring full-stack engineering, relational data modeling, authentication, financial calculations, UI design, and cloud deployment.

The goal is simple: **make financial information easier to organize, understand, and act on.**

---

<div align="center">

### Built by **Syed Nazeer S**

[GitHub Profile](https://github.com/Syed-Nazeer-07) · [Finora Repository](https://github.com/Syed-Nazeer-07/Finora) · [Live Demo](https://finora-syed-nazeer-ss-projects.vercel.app)

<sub>Made with care as a CS50x Final Project. Financial insights are informational, not investment or professional financial advice.</sub>

</div>
