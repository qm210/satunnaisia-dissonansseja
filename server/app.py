import atexit
import logging
from pathlib import Path
from tempfile import TemporaryDirectory

from server.api.rating import api as rating_api
from server.api.sointu import api as sointu_call_api
from server.containers import Container
from server.json_provider import JsonProvider

from flask_migrate import Migrate
from flask import send_from_directory
from flask_socketio import SocketIO


def create_app():
    container = Container()
    container.wire(packages=[".api"], from_package="server")

    app = container.app()
    app.container = container

    db_file = Path(__file__).parent.parent / container.config()['db']['file']
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_file}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = container.db()
    with app.app_context():
        db.create_all()

    Migrate(app, db)

    # app.config['DEBUG'] is taken from FLASK_DEBUG env variable
    app.logger.setLevel(
        logging.DEBUG if app.config['DEBUG'] else logging.INFO
    )

    app.register_blueprint(rating_api, url_prefix="/api")
    app.register_blueprint(sointu_call_api, url_prefix="/api/sointu")

    app.json_provider_class = JsonProvider
    app.json = JsonProvider(app)

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, "index.html")

    # first had the socketio injected as a dependency, this caused problems,
    # now we glue it to the app via its config dictionary.
    socketio = SocketIO(
        app,
        async_mode='eventlet',
        cors_allowed_origins=["http://localhost:5173"],
        logger=True,
        # TODO: need message_queue?
    )
    app.config['SOCKETIO'] = socketio

    socket_service = container.socket_service()
    socketio.on_event('connect', socket_service.on_connect)
    socketio.on_event('disconnect', socket_service.on_disconnect)
    socketio.on_event('error', socket_service.on_error)
    socketio.on_event('message', socket_service.on_message)

    # TOOD question: why can I just monkey-patch app.temp_dir without problems,
    # but it didn't work similarly with app.socketio i.e. I had to use app.config['SOCKETIO'] instead?
    temp_dir = TemporaryDirectory()  # TODO: should be put into an @app.before_first_request?
    app.logger.debug(f"Init Temp Dir: %s", temp_dir.name)
    app.temp_path = Path(temp_dir.name)

    atexit.register(lambda exc=None: teardown_app(app, temp_dir, exc))

    return app


def teardown_app(app, temp_dir=None, exception=None):
    if exception is not None:
        app.logger.error("Exit due to Error: %s", exception)

    app.logger.debug("Cleanup Temp Dir: %s", temp_dir.name)
    if temp_dir is not None:
        temp_dir.cleanup()
        # TODO: check that these really get cleaned up and are not spamming unto my hard drive


if __name__ == '__main__':
    # eventlet.monkey_patch() must be run "before importing any other modules". sounds greedy, but here we are.
    import eventlet

    eventlet.monkey_patch()

    app = create_app()
    app.logger.info(
        "Welcome to Satunnaisia Dissonansseja (unclear whether written correctly, am not Finnish)"
    )
    socketio = app.config['SOCKETIO']
    socketio.run(app, debug=False, log_output=True, use_reloader=app.config['DEBUG'])
