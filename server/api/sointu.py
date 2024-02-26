from dependency_injector.wiring import Provide, inject
from flask import Blueprint, Response, jsonify, request

from server.containers import Container
from server.utils.error import InstrumentConfigNotPersisted

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
def execute_sointu_run(sointu_service=Provide[Container.sointu_service]):
    run_json = request.get_json()
    try:
        instrument_run_id = sointu_service.initiate_run(run_json)
    except InstrumentConfigNotPersisted:
        return (
            "Cannot start run without any persisted instrument config. Save this config (again), and try again",
            404
        )
    return str(instrument_run_id), 200


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
