<div align="center">

<img src="static/branding/logo1.png" alt="Finora" width="84" />

# Finora

### Make sense of your money.

A personal finance workspace for tracking spending, planning budgets, managing savings goals, and understanding your financial picture — all in one place.

<br>

[![Launch Finora](https://img.shields.io/badge/Launch_Finora-0F766E?style=for-the-badge&logo=vercel&logoColor=white)](https://finora-syed-nazeer-ss-projects.vercel.app)

<br><br>

**Python** · **Flask** · **PostgreSQL** · **SQLAlchemy** · **JavaScript** · **Tailwind CSS**

<br>

[Overview](#overview) &nbsp;·&nbsp; [Features](#features) &nbsp;·&nbsp; [Architecture](#architecture) &nbsp;·&nbsp; [Local setup](#local-setup) &nbsp;·&nbsp; [Deployment](#deployment)

</div>

---

## Overview

**Finora turns everyday financial activity into a clearer view of where your money goes and how your goals are progressing.**

Transactions, budgets, savings goals, investment records, and financial summaries live in one responsive application. The interface emphasizes useful information and straightforward workflows rather than overwhelming users with disconnected metrics.

Built with **Flask and vanilla JavaScript**, Finora is a full-stack project created for **Harvard's CS50x final project** and expanded with authentication, relational data modeling, interactive reporting, and cloud deployment.

## Features

| | |
| --- | --- |
| **Financial dashboard** | Explore income, expenses, balances, budget usage, goals, and financial summaries from one view. |
| **Transactions** | Add, edit, remove, search, and categorize financial activity. |
| **Budget management** | Set category spending limits and compare planned amounts against recorded expenses. |
| **Savings goals** | Define targets, track contributions, and see progress over time. |
| **Investment portfolio** | Record investments and track their contribution to your financial position. |
| **Insights & reporting** | Review spending patterns, cash flow, and financial health indicators with interactive charts. |
| **Account management** | Manage your profile and settings with authenticated, account-scoped financial records. |
| **Data export** | Export transaction and financial data using dedicated application endpoints. |

### The workflow

**01 — Record.** Add income, expenses, and investment activity as they happen.

**02 — Plan.** Create category budgets and savings targets that reflect your priorities.

**03 — Understand.** Use the dashboard and visual summaries to see patterns and measure progress.

> Finora is a finance **tracking and planning** tool. It does not link directly to bank accounts, move money, or execute trades.

## Architecture

Finora uses a server-rendered Flask application with JavaScript-enhanced pages. Financial operations are processed through Flask API routes, persisted using SQLAlchemy, and associated with the authenticated account.

```text
                       FINORA
                          │
                  Browser interface
             HTML · CSS · JavaScript
                          │
                 Flask application
             Pages · JSON APIs · Auth
                          │
                 SQLAlchemy ORM
                          │
           ┌──────────────┴─────────────┐
           │                            │
      PostgreSQL                     SQLite
      (hosting)                   (local dev)
```

### Technology

| Area | Stack |
| --- | --- |
| **Application** | Python, Flask, Jinja2 |
| **Interface** | HTML, CSS, vanilla JavaScript, Tailwind CSS, Chart.js, Lucide |
| **Persistence** | SQLAlchemy, Flask-SQLAlchemy, PostgreSQL, SQLite |
| **Authentication** | Flask sessions, password hashing, Google OAuth with Authlib |
| **Email** | Resend or SMTP for verification and password recovery |
| **Deployment** | Vercel with external PostgreSQL (Neon) |
| **Development** | pytest, Node.js built-in test runner, Flask-Migrate / Alembic |

### Repository layout

```text
Finora/
├── app.py                 Flask app, models, routes, and APIs
├── requirements.txt       Python dependencies
├── .env.example           Environment template
├── templates/             Authentication and application pages
├── static/
│   ├── css/               Styles
│   ├── js/                Frontend interactions and charts
│   └── branding/          Visual identity
└── tests/                 Backend and frontend tests
```

The frontend is built with **vanilla JavaScript**, not a separate React/Vite application.

## Local setup

**Requirements:** Python 3.12 (recommended), Git, and pip.

**1. Clone the repository**

```bash
git clone https://github.com/Syed-Nazeer-07/Finora.git
cd Finora
```

**2. Create a virtual environment**

<details>
<summary><strong>Windows (PowerShell)</strong></summary>

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

</details>

<details>
<summary><strong>macOS / Linux</strong></summary>

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

</details>

**3. Install dependencies**

```bash
python -m pip install -r requirements.txt
```

**4. Configure your environment**

Copy the included `.env.example` to `.env` and replace the placeholder `SECRET_KEY`. The sample configuration uses SQLite for local development.

Email verification and password recovery require a configured email provider; Google sign-in requires OAuth credentials. See the comments in [`.env.example`](.env.example) for the supported variables.

**5. Start the server**

```bash
flask --app app run --debug
```

Open [localhost:5000/login](http://127.0.0.1:5000/login).

## Deployment

Finora is designed to run on **Vercel** with a durable external **PostgreSQL** database. For a separate deployment, configure `DATABASE_URL`, `SECRET_KEY`, and production settings in the hosting environment. Email and Google OAuth features need their own provider configuration.

<details>
<summary><strong>Deployment configuration details</strong></summary>

1. Import this repository into Vercel and set the project root to the repository root.
2. Provision a PostgreSQL database, such as Neon, and set `DATABASE_URL`.
3. Set a secure `SECRET_KEY`, `FLASK_ENV=production`, and `PREFERRED_URL_SCHEME=https`.
4. Configure `RESEND_API_KEY` and `EMAIL_FROM` or valid SMTP credentials for account emails.
5. If using Google OAuth, configure your production domain's `/auth/google/callback` redirect URI.
6. Redeploy, then test account creation, verification, login, financial changes, and persistence using your production configuration.

**Storage:** use external PostgreSQL for hosted financial records; SQLite files inside serverless deployments are not suitable for durable persistence.

</details>

## Testing

The repository contains tests for authentication, financial operations, data validation, and user data isolation.

```bash
# Python test suite
python -m pytest -q

# JavaScript test suite (Node.js required)
node --test tests/*.test.cjs
```

These commands run the automated test suites locally; they are not a substitute for checking optional integrations in a deployed environment.

## Security & privacy

- Financial records are accessed through authenticated, account-scoped routes.
- Credentials and service keys are configured through environment variables rather than committed to source.
- Password handling, session management, and financial input validation are implemented on the backend.
- Deployments should use HTTPS, protect database access, maintain backups, and review security controls before storing sensitive real-world information.

## Project background

Finora began as a **CS50x Final Project** and grew into a broader exercise in full-stack engineering: application architecture, database relationships, financial calculations, login flows, interactive interfaces, and cloud hosting.

Future development may include recurring transactions, richer historical reporting, accessibility refinements, and expanded automated checks.

---

<div align="center">

**Finora** · Built by [Syed Nazeer S](https://github.com/Syed-Nazeer-07)

<sub>Personal finance made clearer. Financial insights are informational and are not professional financial, tax, or investment advice.</sub>

</div>
