from flask import current_app, Blueprint

api = Blueprint('api', __name__)


@api.route('/all', methods=['GET'])
def all_waves():
    return current_app.files_service.get_all_wavs()


@api.route('/info')
def some_bullshit():
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"
