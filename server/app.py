import atexit
import logging
from pathlib import Path
from tempfile import TemporaryDirectory

from flask import send_from_directory
from flask_migrate import Migrate

from server.api.rating import api as rating_api
from server.api.sointu import api as sointu_call_api
from server.containers import Container
from server.json import JsonProvider


def create_app():
    container = Container()
    container.wire(packages=[".api"])

    app = container.app()
    app.container = container

    db_file = Path(__file__).parent.parent / container.config()['db']['file']
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_file}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = container.db()
    with app.app_context():
        db.create_all()

    Migrate(app, db)

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

    socketio = container.socketio()
    socketio.init_app(app)
    socket_service = container.socket_service()
    socketio.on_event('connect', socket_service.on_connect)
    socketio.on_event('disconnect', socket_service.on_disconnect)
    socketio.on_event('error', socket_service.on_error)
    socketio.on_event('message', socket_service.on_message)

    app.temp_dir = TemporaryDirectory()
    # <-- TODO: need to put that into an @app.before_first_request?
    print("INIT", app.temp_dir)

    def on_exit(exception=None):
        print("TEARDOWN", app.temp_dir)
        if app.temp_dir is not None:
            app.temp_dir.cleanup()
            # TODO: check that these really get cleaned up and are not spamming unto my hard drive

    atexit.register(on_exit)

    return app
