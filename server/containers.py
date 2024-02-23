from dependency_injector import containers, providers
from dependency_injector.ext import flask
from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

from server.model.base import Base
from server.repositories.instrument_config import InstrumentConfigRepository
from server.repositories.rating import RatingRepository
from server.repositories.user import UserRepository
from server.service.instruments import InstrumentsService
from server.service.socket import SocketService
from server.service.wav_files import WavFilesService
from server.service.sointu import SointuService
from server.sointu.downloader import Downloader


class Container(containers.DeclarativeContainer):
    config = providers.Configuration(
        yaml_files=["config.yml"],
        default={
            "db": {
                "file": "db/db.sqlite3"
            },
            "wav": {
                "folder": "wav/",
            },
            "templates": {
                "folder": "server/templates/",
                "instrument": "instrument.yml",
                "sequence": "sequence.yml",
                "asm": "wav.asm"
            },
            "instruments": {
                "folder": "instruments/"
            }
        }
    )

    app = flask.Application(
        Flask,
        __name__,
        static_folder='public',
        static_url_path='/',
        instance_relative_config=True,
    )

    socketio = providers.Factory(
        SocketIO,
        app=app,
        logger=True,
        engineio_logger=True,
        message_queue=config.socketio.message_queue
    )

    socket_service = providers.Factory(
        SocketService,
        socketio=socketio,
        logger=app.provided.logger,
    )

    db = providers.Singleton(
        SQLAlchemy,
        app=app,
        model_class=Base
    )

    user_repository = providers.Factory(
        UserRepository,
        session_factory=db.provided.session
    )

    rating_repository = providers.Factory(
        RatingRepository,
        session_factory=db.provided.session
    )

    instrument_config_repository = providers.Factory(
        InstrumentConfigRepository,
        session_factory=db.provided.session
    )

    wav_files_service = providers.Factory(
        WavFilesService,
        config=config,
        rating_repository=rating_repository
    )

    downloader = providers.Singleton(
        Downloader
    )

    sointu_service = providers.Factory(
        SointuService,
        config=config,
        app_path=app.provided.root_path(),
        downloader=downloader
    )

    instruments_service = providers.Factory(
        InstrumentsService,
        config=config,
        logger=app.provided.logger,
        sointu_service=sointu_service,
        instrument_config_repository=instrument_config_repository
    )
