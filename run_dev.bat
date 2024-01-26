@echo off

set FLASK_ENV=development

call poetry run flask --app "server/app.py" run
