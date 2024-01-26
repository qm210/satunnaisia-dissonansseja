Set-Item -Path Env:FLASK_ENV -Value "development"

poetry run flask --app "src/app.py" run
