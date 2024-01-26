from flask import Blueprint, send_from_directory, current_app

bp = Blueprint('routes', __name__)


@bp.route('/<path:path>')
def serve(path):
    return send_from_directory('public', path)


@bp.route('/info')
def some_bullshit():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"


@bp.route('/all')
def all_waves():
    return current_app.files_service.get_all_wavs()
