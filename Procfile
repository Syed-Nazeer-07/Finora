web: gunicorn app:app --workers 4 --worker-class sync --worker-tmp-dir /dev/shm --timeout 120 --keep-alive 5
release: flask db upgrade
