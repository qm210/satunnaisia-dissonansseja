from dependency_injector.wiring import Provide, inject
from flask import Blueprint

from server.containers import Container

api = Blueprint('execution', __name__)


@api.route('/try-execute', methods=['POST'])
@inject
def try_calling_sointu_for_debug(sointu_service=Provide[Container.sointu_service]):
    result = sointu_service.write_test()
    return result, 501  # 501: Not Implemented
