from flask import current_app, Blueprint, send_file

api = Blueprint('api', __name__)


@api.route('/info')
def some_bullshit_but_glad_that_i_am_alive():
    # this is just the "are you alive?" endpoint ;)
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"


@api.route('/all', methods=['GET'])
def all_waves():
    return current_app.files_service.get_all_wavs()


@api.route('/wav/<path:path>', methods=['GET'])
def play_single_wave(path):
    current_app.logger.info(f"loggedilogg {path}")
    return send_file(path, mimetype='audio/wav')
