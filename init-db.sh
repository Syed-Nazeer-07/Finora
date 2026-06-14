#!/bin/bash
# Initialize Flask-Migrate for Finora
# Run this once to set up migrations

cd "$(dirname "$0")"

# Create migrations directory if it doesn't exist
if [ ! -d "migrations" ]; then
    echo "Initializing Flask-Migrate..."
    flask db init
    echo "Generating initial migration..."
    flask db migrate -m "Initial migration"
    echo "Applying migration..."
    flask db upgrade
    echo "✓ Migrations initialized"
else
    echo "Migrations directory already exists. Skipping initialization."
fi
