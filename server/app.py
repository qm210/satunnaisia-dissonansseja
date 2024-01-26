import logging

from flask import Flask

from server.db import init_database
from server.routes import bp as routes

app = Flask(__name__)

app.logger.setLevel(logging.INFO)

db = init_database(app, "db.sqlite3")

app.register_blueprint(routes)
