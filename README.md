# Finora - Personal Finance Manager

Finora is a sleek, dynamic personal finance management application that helps you track your income, expenses, budgets, investments, and financial goals all in one centralized dashboard. 

## 🚀 Features
- **Dashboard Overview**: Get a holistic view of your financial health, net worth, cash flow, and monthly spending.
- **Transaction Tracking**: Add, edit, and delete transactions. Supports both cash flow and manual point-in-time entries.
- **Budget Management**: Set monthly budgets for different categories and track your usage visually.
- **Financial Goals**: Save towards specific milestones with built-in progress tracking.
- **Investment Portfolio**: Track your assets, stock purchases, and current market value.
- **Responsive UI**: A modern, mobile-first design with dynamic micro-animations, glassmorphism aesthetics, and a seamless SPA experience.
- **Smart Analytics**: Automated calculation of your financial health score, analyzing stability, growth, savings rate, and more.

## 🛠 Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, TailwindCSS (for rapid modern styling), Lucide Icons.
- **Backend**: Python 3, Flask, SQLAlchemy, Werkzeug (for proxy support in production).
- **Database**: PostgreSQL / SQLite (for local development).
- **Authentication**: Email/Password + Google OAuth support.

## 📦 Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Finora
   ```

2. **Create a virtual environment and install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your_secret_key
   SQLALCHEMY_DATABASE_URI=sqlite:///finora.db
   ```

4. **Run the Application:**
   ```bash
   flask run
   ```
   The application will be available at `http://127.0.0.1:5000/`.

## 🧪 Testing
We use `pytest` for backend API testing.
```bash
pytest tests/
```

## 🌐 Deployment
The application is designed to be easily deployed on platforms like Railway or Heroku. Ensure you configure your production WSGI server (e.g., gunicorn) and map your persistent PostgreSQL database appropriately. 

## 📝 License
This project is licensed under the MIT License.
