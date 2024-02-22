from dependency_injector.wiring import Provide, inject
from flask import Blueprint, Response, jsonify, request

from server.containers import Container

api = Blueprint('execution', __name__)


@api.route('/try-execute')
@inject
def try_calling_sointu_for_debug(sointu_service=Provide[Container.sointu_service]):
    # run and return log as stream (via generator)
    return Response(
        sointu_service.run_test_execute("test.wav"),
        mimetype='text/plain'
    )


@api.route('/instrument', methods=['GET'])
@inject
def get_all_instruments(instruments_service=Provide[Container.instruments_service]):
    result = instruments_service.get_all()
    return jsonify(result)


@api.route('/instrument', methods=['POST'])
@inject
def post_instrument_config(instruments_service=Provide[Container.instruments_service]):
    # TODO: allow, for a single .yml, to choose between multiple stored configs
    instruments_service.store_instrument_config(request.get_json())
    return "", 200
