import string
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path

db_dir = Path(__file__).parent.parent / "db"


def init_database(app: Flask, db_file: string) -> SQLAlchemy:
    path = f'sqlite:///{db_dir / db_file}'
    app.config['SQLALCHEMY_DATABASE_URI'] = path
    app.logger.info(f"Used database: {path}")
    db = SQLAlchemy(app)
    with app.app_context():
        db.create_all()
    return db
