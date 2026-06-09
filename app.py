from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import date, datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///wealthsync.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

db = SQLAlchemy(app)


# ─── Models ───────────────────────────────────────────────────────────────────

class User(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    profile      = db.relationship("Profile",     back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class Profile(db.Model):
    id                   = db.Column(db.Integer, primary_key=True)
    user_id              = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    monthly_income       = db.Column(db.Float, default=0)
    current_savings      = db.Column(db.Float, default=0)
    current_investments  = db.Column(db.Float, default=0)
    monthly_expenses     = db.Column(db.Float, default=0)
    financial_goal       = db.Column(db.String(200), default="")
    onboarding_completed = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="profile")


class Transaction(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    description = db.Column(db.String(100), nullable=False)
    amount      = db.Column(db.Float, nullable=False)
    category    = db.Column(db.String(50), nullable=False)
    type        = db.Column(db.String(10), nullable=False, default="expense")
    date        = db.Column(db.String(10), nullable=False, default=str(date.today()))

    user = db.relationship("User", back_populates="transactions")


# ─── Seed ─────────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

    if User.query.count() == 0:
        demo = User(
            name="Nazeer",
            email="nazeer@wealthsync.app",
            password_hash=generate_password_hash("changeme"),
        )
        db.session.add(demo)
        db.session.flush()

        db.session.add(Profile(user_id=demo.id))

        if Transaction.query.count() == 0:
            db.session.add_all([
                Transaction(user_id=demo.id, description="TechCorp Salary",     amount=150000, category="Salary",       type="income",  date="2026-06-05"),
                Transaction(user_id=demo.id, description="Amazon Purchase",      amount=12000,  category="Shopping",      type="expense", date="2026-06-08"),
                Transaction(user_id=demo.id, description="Zomato Delivery",      amount=850,    category="Food & Dining", type="expense", date="2026-06-03"),
                Transaction(user_id=demo.id, description="Apartment Rent",       amount=25000,  category="Housing",       type="expense", date="2026-06-01"),
                Transaction(user_id=demo.id, description="Netflix Subscription", amount=649,    category="Entertainment", type="expense", date="2026-05-28"),
                Transaction(user_id=demo.id, description="Uber Rides",           amount=1240,   category="Transport",     type="expense", date="2026-05-25"),
            ])
        else:
            Transaction.query.filter_by(user_id=None).update({"user_id": demo.id})

        db.session.commit()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def current_user():
    uid = session.get("user_id")
    return User.query.get(uid) if uid else None

def login_required_json():
    """Returns a 401 JSON response if not logged in, else None."""
    if not session.get("user_id"):
        return jsonify({"error": "Unauthorized"}), 401
    return None

def _tx_dict(t):
    return {"id": t.id, "description": t.description, "amount": t.amount,
            "category": t.category, "type": t.type, "date": t.date}

def _validate_tx(data):
    required = ["description", "amount", "category", "type", "date"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return None, (jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400)
    if data["type"] not in ("income", "expense"):
        return None, (jsonify({"error": "type must be 'income' or 'expense'"}), 400)
    try:
        return float(data["amount"]), None
    except (ValueError, TypeError):
        return None, (jsonify({"error": "amount must be a number"}), 400)


# ─── Auth routes ──────────────────────────────────────────────────────────────

@app.route("/login")
def login_page():
    if session.get("user_id"):
        return redirect(url_for("index"))
    return render_template("login.html")


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name  = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists"}), 409

    user = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.flush()
    db.session.add(Profile(user_id=user.id))
    db.session.commit()

    session["user_id"] = user.id
    return jsonify({"id": user.id, "name": user.name, "email": user.email}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
    return jsonify({"id": user.id, "name": user.name, "email": user.email})


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/api/auth/me")
def me():
    user = current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"id": user.id, "name": user.name, "email": user.email})


# ─── App routes ───────────────────────────────────────────────────────────────

@app.route("/")
def index():
    if not session.get("user_id"):
        return redirect(url_for("login_page"))
    return render_template("index.html")


@app.route("/onboarding")
def onboarding_page():
    if not session.get("user_id"):
        return redirect(url_for("login_page"))
    return render_template("onboarding.html")


# ─── Profile API ─────────────────────────────────────────────────────────────

@app.route("/api/profile", methods=["GET"])
def get_profile():
    err = login_required_json()
    if err: return err
    p = Profile.query.filter_by(user_id=session["user_id"]).first()
    if not p:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify({
        "monthly_income":      p.monthly_income,
        "current_savings":     p.current_savings,
        "current_investments": p.current_investments,
        "monthly_expenses":    p.monthly_expenses,
        "financial_goal":      p.financial_goal,
        "onboarding_completed": p.onboarding_completed,
    })


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    err = login_required_json()
    if err: return err
    p = Profile.query.filter_by(user_id=session["user_id"]).first()
    if not p:
        return jsonify({"error": "Profile not found"}), 404
    data = request.get_json(silent=True) or {}
    if "monthly_income"      in data: p.monthly_income      = float(data["monthly_income"] or 0)
    if "current_savings"     in data: p.current_savings     = float(data["current_savings"] or 0)
    if "current_investments" in data: p.current_investments = float(data["current_investments"] or 0)
    if "monthly_expenses"    in data: p.monthly_expenses    = float(data["monthly_expenses"] or 0)
    if "financial_goal"      in data: p.financial_goal      = str(data["financial_goal"])[:200]
    if "onboarding_completed" in data: p.onboarding_completed = bool(data["onboarding_completed"])
    db.session.commit()
    return jsonify({"success": True})




@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    err = login_required_json()
    if err: return err
    txs = Transaction.query.filter_by(user_id=session["user_id"]).order_by(Transaction.date.desc()).all()
    return jsonify([_tx_dict(t) for t in txs])


@app.route("/api/transactions", methods=["POST"])
def create_transaction():
    err = login_required_json()
    if err: return err
    data = request.get_json(silent=True) or {}
    amount, err = _validate_tx(data)
    if err: return err
    t = Transaction(
        user_id=session["user_id"],
        description=str(data["description"])[:100],
        amount=amount,
        category=str(data["category"])[:50],
        type=data["type"],
        date=str(data["date"]),
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(_tx_dict(t)), 201


@app.route("/api/transactions/<int:tx_id>", methods=["PUT"])
def update_transaction(tx_id):
    err = login_required_json()
    if err: return err
    t = Transaction.query.filter_by(id=tx_id, user_id=session["user_id"]).first()
    if not t:
        return jsonify({"error": "Transaction not found"}), 404
    data = request.get_json(silent=True) or {}
    amount, err = _validate_tx(data)
    if err: return err
    t.description = str(data["description"])[:100]
    t.amount      = amount
    t.category    = str(data["category"])[:50]
    t.type        = data["type"]
    t.date        = str(data["date"])
    db.session.commit()
    return jsonify(_tx_dict(t))


@app.route("/api/transactions/<int:tx_id>", methods=["DELETE"])
def delete_transaction(tx_id):
    err = login_required_json()
    if err: return err
    t = Transaction.query.filter_by(id=tx_id, user_id=session["user_id"]).first()
    if not t:
        return jsonify({"error": "Transaction not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
