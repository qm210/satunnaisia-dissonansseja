import logging

from flask import Flask

from server.db import init_database
from server.routes import bp as routes
from server.service.files import FilesService

app = Flask(__name__)

app.logger.setLevel(
    logging.DEBUG if app.config['DEBUG'] else logging.INFO
)

db = init_database(app, "db.sqlite3")

app.files_service = FilesService(app, db)

app.register_blueprint(routes)
