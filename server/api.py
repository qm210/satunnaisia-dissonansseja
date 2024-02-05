from dependency_injector.wiring import Provide, inject
from flask import Blueprint, send_file, abort, request

from server.containers import Container

api = Blueprint('api', __name__)


@api.route('/info')
def some_bullshit_but_glad_that_i_am_alive():
    # this is just the "are you alive?" endpoint ;)
    return "'you gonne be my Hubschrauberlandeplatz?' - Johann Lafer, ca. 2018"


@api.route('/all', methods=['GET'])
@inject
def all_waves(files_service=Provide[Container.files_service]):
    return files_service.get_all_wavs()


@api.route('/wav/<path:file>', methods=['GET'])
@inject
def play_single_wave(file, files_service=Provide[Container.files_service]):
    path = files_service.get_single_wav_path(file)
    if path is None:
        abort(404)
    return send_file(path, mimetype='audio/wav')


@api.route('/ratings', methods=['POST'])
@inject
def post_ratings(files_service=Provide[Container.files_service]):
    ratings = request.get_json()
    files_service.store_new_ratings(ratings)
    return "lol", 200
