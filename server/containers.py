from dependency_injector import containers, providers
from dependency_injector.ext import flask
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from server.service.files import FilesService


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
    )

    files_service = providers.Factory(
        FilesService,
        db=db,
        config=config,
    )
