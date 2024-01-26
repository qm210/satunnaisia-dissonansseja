from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
