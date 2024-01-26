from flask import Blueprint

bp = Blueprint('routes', __name__)


@bp.route('/')
def index():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
