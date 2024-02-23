from dependency_injector.wiring import Provide, inject
from flask import Blueprint, Response, jsonify, request

from server.containers import Container

api = Blueprint('execution', __name__)


@api.route('/test-execute')
@inject
def try_calling_sointu_for_debug(sointu_service=Provide[Container.sointu_service]):
    """
    This is the first attempt - run Sointu for a test.wav and return log as stream (via generator)
    Has to be a GET method for that, I believe.

    We try to improve this later with socketio, see execute-run endpoint (=
    """
    return Response(
        sointu_service.run_test_execute("test.wav"),
        mimetype='text/plain'
    )


@api.route('/execute-run', methods=['POST'])
@inject
def execute_sointu_run(sointu_service=Provide[Container.sointu_service],
                       instruments_service=Provide[Container.instruments_service]):
    body = request.get_json()
    instrument_run = instruments_service.prepare_run(body)
    sointu_service.initiate_run(instrument_run)
    return (
        str(instrument_run.id) if instrument_run.id is not None else "null",
        200
    )


@api.route('/instrument', methods=['GET'])
@inject
def get_all_instruments(instruments_service=Provide[Container.instruments_service]):
    result = instruments_service.get_all()
    return jsonify(result)


@api.route('/instrument', methods=['POST'])
@inject
def post_instrument_config(instruments_service=Provide[Container.instruments_service]):
    # TODO but not now - maybe, allow, for a single .yml, to choose between multiple stored configs
    instruments_service.store_instrument_config(request.get_json())
    return "", 200
