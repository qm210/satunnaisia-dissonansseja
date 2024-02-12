from dependency_injector.wiring import Provide, inject
from flask import Blueprint, Response

from server.containers import Container

api = Blueprint('execution', __name__)


@api.route('/try-execute')
@inject
def try_calling_sointu_for_debug(sointu_service=Provide[Container.sointu_service]):
    # run and return log as stream (via generator)
    return Response(
        # sointu_service.run_test_execute("test.wav"),
        sointu_service.run_some_testing(),
        mimetype='text/plain'
    )
