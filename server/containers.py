from dependency_injector import containers, providers
from dependency_injector.ext import flask
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from server.model.base import Base
from server.repositories.rating import RatingRepository
from server.repositories.user import UserRepository
from server.service.files import FilesService
from server.service.sointu import SointuService


class Container(containers.DeclarativeContainer):
    config = providers.Configuration(
        yaml_files=["config.yml"],
        default={
            "db": {
                "file": "db/db.sqlite3"
            },
            "wav": {
                "folder": "wav"
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

    files_service = providers.Factory(
        FilesService,
        config=config,
        rating_repository=rating_repository
    )

    sointu_service = providers.Factory(
        SointuService,
        config=config
    )
