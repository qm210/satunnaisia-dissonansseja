from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////'


@app.route('/')
def index():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
