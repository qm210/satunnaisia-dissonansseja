# Run

Current way to run the Flask Backend in Dev mode is to start

```
poetry run python server/wsgi.py

# QM: i run with these ENV variables set, change as you please
PYTHONUNBUFFERED=1
FLASK_DEBUG=1
FLASK_ENV=development
```

# Migrate DB

Create migrations:

```
flask db migrate -m "..."
```

Apply them:

```
flask db upgrade
```

## Run (old dev mode, might not support socket updates)

see `run_dev.bat` / `run_dev.ps1` or somehow manage to run the `server/app.py` script using the Python of your choice.

If `FLASK_APP` is not set properly in `.flaskenv`, you might need to always call `flask --app "server/app.py"` or
whatevs -- guess you'll manage.
