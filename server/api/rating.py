from dependency_injector.wiring import Provide, inject
from flask import Blueprint, send_file, abort, request

from server.containers import Container

api = Blueprint('rating', __name__)


@api.route('/info')
def some_bullshit_but_glad_that_i_am_alive():
    # this is just the "are you alive?" endpoint ;)
    return [
        "\"You gonne be my HUBSCHRAUBERLANDEPLATZ?\"",
        "Johann Lafer, ca. 2018, koloriert"
    ]


@api.route('/all', methods=['GET'])
@inject
def all_wavs(files_service=Provide[Container.files_service]):
    return files_service.get_all_wavs()


@api.route('/unrated/<username>', methods=['GET'])
@inject
def get_unrated_wavs(username, files_service=Provide[Container.files_service]):
    return files_service.get_unrated_wavs_for(username)


@api.route('/rated', methods=['DELETE'])
@inject
def delete_all_ratings_for_user(rating_repository=Provide[Container.rating_repository]):
    username = request.args.get('username')
    number_deleted = rating_repository.delete_all_ratings_for_user(username)
    return str(number_deleted), 200


@api.route('/wav/<path:file>', methods=['GET'])
@inject
def play_single_wav(file, files_service=Provide[Container.files_service]):
    path = files_service.get_single_wav_path(file)
    if path is None:
        abort(404)
    return send_file(path, mimetype='audio/wav')


@api.route('/ratings', methods=['POST'])
@inject
def post_ratings(rating_repository=Provide[Container.rating_repository]):
    ratings = request.get_json().get('ratings')
    username = request.get_json().get('username')
    new_ids = rating_repository.add_multiple_for_user(ratings, username)
    return new_ids, 200


@api.route('/user', methods=['POST'])
@inject
def check_user(user_repository=Provide[Container.user_repository]):
    name = request.get_json().get("username")
    user = user_repository.check_user(name)
    return user
