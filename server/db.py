import string
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path

cwd = Path(__file__).parent


def init_database(app: Flask, db_file: string) -> SQLAlchemy:
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'sqlite:////{cwd}/{db_file}'
    )
    db = SQLAlchemy(app)
    return db
