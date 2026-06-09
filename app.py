from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import date, datetime
from werkzeug.security import generate_password_hash

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///wealthsync.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# ─── Models ───────────────────────────────────────────────────────────────────

class User(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile      = db.relationship("Profile",      back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = db.relationship("Transaction",  back_populates="user", cascade="all, delete-orphan")


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
        db.session.flush()  # get demo.id before commit

        db.session.add(Profile(user_id=demo.id))

        if Transaction.query.count() == 0:
            db.session.add_all([
                Transaction(user_id=demo.id, description="TechCorp Salary",     amount=150000, category="Salary",         type="income",  date="2026-06-05"),
                Transaction(user_id=demo.id, description="Amazon Purchase",      amount=12000,  category="Shopping",        type="expense", date="2026-06-08"),
                Transaction(user_id=demo.id, description="Zomato Delivery",      amount=850,    category="Food & Dining",   type="expense", date="2026-06-03"),
                Transaction(user_id=demo.id, description="Apartment Rent",       amount=25000,  category="Housing",         type="expense", date="2026-06-01"),
                Transaction(user_id=demo.id, description="Netflix Subscription", amount=649,    category="Entertainment",   type="expense", date="2026-05-28"),
                Transaction(user_id=demo.id, description="Uber Rides",           amount=1240,   category="Transport",       type="expense", date="2026-05-25"),
            ])
        else:
            # Backfill user_id on any existing transactions that lack one
            Transaction.query.filter_by(user_id=None).update({"user_id": demo.id})

        db.session.commit()


# ─── Routes ───────────────────────────────────────────────────────────────────

def _tx_dict(t):
    return {"id": t.id, "description": t.description, "amount": t.amount,
            "category": t.category, "type": t.type, "date": t.date}

def _validate_tx(data):
    """Returns (amount, error_response) tuple."""
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


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.date.desc()).all()
    return jsonify([_tx_dict(t) for t in transactions])


@app.route("/api/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json(silent=True) or {}
    amount, err = _validate_tx(data)
    if err:
        return err
    demo = User.query.first()
    t = Transaction(
        user_id=demo.id if demo else None,
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
    t = Transaction.query.get(tx_id)
    if not t:
        return jsonify({"error": "Transaction not found"}), 404
    data = request.get_json(silent=True) or {}
    amount, err = _validate_tx(data)
    if err:
        return err
    t.description = str(data["description"])[:100]
    t.amount      = amount
    t.category    = str(data["category"])[:50]
    t.type        = data["type"]
    t.date        = str(data["date"])
    db.session.commit()
    return jsonify(_tx_dict(t))


@app.route("/api/transactions/<int:tx_id>", methods=["DELETE"])
def delete_transaction(tx_id):
    t = Transaction.query.get(tx_id)
    if not t:
        return jsonify({"error": "Transaction not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
