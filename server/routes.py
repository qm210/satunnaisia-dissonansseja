from flask import Blueprint, send_from_directory

bp = Blueprint('routes', __name__)


@bp.route('/<path:path>')
def serve(path):
    return send_from_directory('public', path)


@bp.route('/info')
def some_bullshit():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
