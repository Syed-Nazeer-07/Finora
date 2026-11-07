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

> **Live demo:** [finoraweb.online](https://finoraweb.online)  
> **Availability:** The hosted demo is currently offline due to hosting budget constraints. The project source code remains available in this repository.

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

## 🧰 Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Lucide Icons | Responsive interface and interactive UI |
| Backend | Python, Flask, Flask Blueprints | Application routes and backend logic |
| ORM | SQLAlchemy | Database models and queries |
| Production database | PostgreSQL | Persistent relational data storage |
| Development database | SQLite | Local development |
| Authentication | Google OAuth, password hashing, sessions | Sign-in and session handling |
| Hosting | Railway | Application and production database deployment |
| Domain and transport | Custom domain, HTTPS | Public access and encrypted connections |

## 🏗️ Project Structure

The application separates route handling, data models, templates, static assets, and reusable business logic. The structure below describes the main areas of the project; exact filenames may vary by repository version.

```text
Finora/
├── app.py              # Flask application entry point
├── models/             # SQLAlchemy models and relationships
├── services/           # Financial calculations and business logic
├── templates/          # Jinja/HTML templates
├── static/             # CSS, JavaScript, images, and UI assets
├── utils/              # Shared helper functions
└── ...                 # Configuration and supporting files
```

### Architectural responsibilities

- **`app.py`** — initializes the Flask application, loads configuration, registers blueprints, and sets up database integration.
- **`models/`** — defines data entities such as users, transactions, budgets, goals, and investments.
- **`services/`** — keeps reusable financial calculations and dashboard logic separate from route handlers.
- **`templates/`** — contains rendered pages such as authentication, onboarding, and dashboard views.
- **`static/`** — contains stylesheets, client-side JavaScript, images, and other interface assets.
- **`utils/`** — provides shared helper functions.

## 🚀 Getting Started

The live deployment is currently unavailable. To run the project locally, use the repository source code.

### Prerequisites

- Python 3.10 or later (use the version supported by the project)
- Git
- pip
- SQLite for local development, or PostgreSQL if configuring a PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/Syed-Nazeer-07/Finora.git
cd Finora
```

### 2. Create and activate a virtual environment

**Windows (PowerShell)**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

If the repository contains a `requirements.txt` file:

```bash
pip install -r requirements.txt
```

If it does not, install the dependencies listed by the project and its configuration. Do not assume a dependency list without checking the repository.

### 4. Configure environment variables

Copy `.env.example` into a local `.env` file. Use a strong random `SECRET_KEY`, and never commit actual keys or passwords. Local development can use SQLite; **Vercel requires a durable PostgreSQL database**, set through `DATABASE_URL`.

For Google sign-in, create a Google OAuth web client and authorize the exact callback URL `https://YOUR_DOMAIN/auth/google/callback`. For account verification and password reset, use **either** Resend (`RESEND_API_KEY`, `EMAIL_FROM`) **or** authenticated SMTP (`MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`). Without a configured email provider, password signups cannot complete verification.

### 5. Initialize the database

During development, the Flask app currently creates missing tables using SQLAlchemy `create_all()`. This is **not a migration system**: it cannot safely alter existing columns or preserve data across arbitrary schema changes. Back up the database before updating models; proper versioned migrations are planned.

### Deploy for free: Vercel + Neon PostgreSQL

1. Connect this GitHub repository to your Vercel project on the Hobby plan (personal, non-commercial use).
2. In **Project Settings → Build and Deployment**, choose **Flask** and set **Root Directory** to the repository root, not `frontend`. Keep build and output commands on their automatic defaults.
3. In **Vercel → Storage → Create Database**, choose **Neon** and its **Free** plan. Create a separate database for Finora and connect it to this Vercel project. Select Production (and Preview only if you actually want it connected).
4. In **Vercel → Environment Variables**, confirm `DATABASE_URL` is present for Production. Never share its value in a public issue, screenshot, or commit. Set `SECRET_KEY` and `PREFERRED_URL_SCHEME=https`.
5. Add the appropriate Google OAuth and email environment variables if those features are required, and authorize the deployed domain in Google Cloud Console.
6. Trigger a fresh deployment. Visit `/health` and verify it returns HTTP 200 with `"status":"healthy"` and `"database":"connected"`. A READY deployment does **not** guarantee database connectivity.
7. Test signup, verification, login, logout, creating a transaction, and retrieving the same transaction after a redeploy. Verify data isolation between accounts.

**Important**: Without `DATABASE_URL`, serverless Finora intentionally serves public pages but responds 503 to database-backed routes. Never use local SQLite inside a Vercel function for real financial records; filesystem changes are not durable.

**Free-tier constraints**: Neon Free has storage, compute and transfer quotas and can suspend compute upon exceeding them. Vercel Hobby is suitable for a small non-commercial portfolio, not a production financial institution. Review the current plans before publishing publicly.

### 6. Run the application

For a standard Flask setup, the application may be started with:

```bash
flask --app app run --debug
```

If the project defines a different startup command, use that command instead. Once running, open the local URL printed by Flask in your browser.

## 🔒 Security Notes

Because Finora handles personal financial information, security and data isolation are important design considerations.

- Keep secret keys, database credentials, and OAuth secrets out of version control.
- Use HTTPS for deployed environments.
- Use secure password hashing and session configuration.
- Protect authenticated routes and enforce user-level data access.
- Use environment-specific configuration for local and production deployments.

## 🧠 Design Decisions

- **Flask:** A lightweight framework that supports clear separation of routes, models, and application logic.
- **SQLAlchemy:** An ORM that makes relational data and model relationships easier to manage.
- **PostgreSQL in production:** A relational database suited to structured financial records and relationships.
- **SQLite for development:** A convenient option for local development.
- **Tailwind CSS:** Utility-first styling for a consistent and responsive interface.
- **Vercel + PostgreSQL:** Flask functions on Vercel with durable PostgreSQL (for example Neon) for small personal deployments.

## 🧩 Challenges and Lessons Learned

Building Finora provided hands-on experience with several full-stack engineering concerns:

- Designing a financial dashboard that makes key metrics easy to understand
- Modeling relationships between users and financial records
- Integrating Google OAuth with application authentication
- Keeping financial calculations consistent across the application
- Configuring production databases, environment variables, and deployment settings
- Connecting a custom domain and configuring HTTPS
- Debugging differences between local and production environments



## 🎓 What I Learned

Finora brought together concepts from CS50 and extended them into a complete application. The project strengthened my understanding of:

- Full-stack web development with Python and Flask
- Relational database design and ORM usage
- Authentication and session management
- API and OAuth integration
- Modular application architecture
- UI/UX design and responsive interfaces
- Cloud deployment, configuration, and production debugging

## ⚠️ Disclaimer

Finora is an educational software project for tracking and understanding personal financial information. Its summaries and indicators are informational and should not be treated as professional financial, investment, tax, or legal advice.

## 👨‍💻 Author

**Syed Nazeer S**

- GitHub: [@Syed-Nazeer-07](https://github.com/Syed-Nazeer-07)
- Project repository: [Finora](https://github.com/Syed-Nazeer-07/Finora)
- Demo URL: [finoraweb.online](https://finoraweb.online) *(currently unavailable)*

---

<div align="center">

**Built with 💚 as my CS50 Final Project**

If you find the project interesting, feel free to explore the repository.

</div>
