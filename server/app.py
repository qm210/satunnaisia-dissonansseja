import logging

from flask import Flask, send_from_directory, g

from server.api import api
from server.db import init_database
from server.service.files import FilesService

app = Flask(__name__,
            static_folder='public',
            static_url_path='/'
            )

app.logger.setLevel(
    logging.DEBUG if app.config['DEBUG'] else logging.INFO
)

db = init_database(app, "db.sqlite3")

app.register_blueprint(api, url_prefix="/api")


@app.before_request
def init_services_on_request():
    g.files_service = FilesService(app, db)


@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

# @app.route('/<path:path>')
# def serve(path):
#     app.logger.info("got here", path)
#     return send_from_directory('public', path)
#
