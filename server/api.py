from flask import g, current_app, Blueprint, send_file, abort

api = Blueprint('api', __name__)


@api.route('/info')
def some_bullshit_but_glad_that_i_am_alive():
    # this is just the "are you alive?" endpoint ;)
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"


@api.route('/all', methods=['GET'])
def all_waves():
    return g.files_service.get_all_wavs()


@api.route('/wav/<path:file>', methods=['GET'])
def play_single_wave(file):
    path = g.files_service.get_single_wav_path(file)
    if path is None:
        abort(404)
    return send_file(path, mimetype='audio/wav')
