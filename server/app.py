import logging

from flask import Flask

from server.db import init_database


app = Flask(__name__)

app.logger.setLevel(logging.INFO)

db = init_database(app, "db.sqlite3")


@app.route('/')
def index():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
