# Run

see `run_dev.bat` / `run_dev.ps1` or somehow manage to run the `server/app.py` script using the Python of your choice.

If `FLASK_APP` is not set properly in `.flaskenv`, you might need to always call `flask --app "server/app.py"` or
whatevs -- guess you'll manage.

# Migrate DB

Create migrations:

```
flask db migrate -m "..."
```

Apply them:

```
flask db upgrade
```
