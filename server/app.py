import logging
from pathlib import Path

from flask import send_from_directory
from flask_migrate import Migrate

from server.api import api
from server.containers import Container


def create_app():
    container = Container()
    container.wire(modules=[".api"])

    app = container.app()
    app.container = container

    db_file = Path(__file__).parent.parent / container.config()['db']['file']
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_file}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = container.db()
    with app.app_context():
        db.create_all()

    migrate = Migrate(app, db)

    app.logger.setLevel(
        logging.DEBUG if app.config['DEBUG'] else logging.INFO
    )

    app.register_blueprint(api, url_prefix="/api")

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, "index.html")

    return app
