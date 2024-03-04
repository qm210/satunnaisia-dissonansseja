from typing import Union

from flask import request
from flask_socketio import emit


class SocketService:
    def __init__(self, socketio, logger):
        self.socketio = socketio
        self.logger = logger
        self.connected_sessions = set()

    def on_connect(self):
        self.connected_sessions.add(request.sid)

    def on_disconnect(self, *args, **kwargs):
        self.connected_sessions.remove(request.sid)

    def on_message(self, *args, **kwargs):
        params = request.args
        self.logger.info("socket message!", params, args, kwargs)

    def on_error(self, *args, **kwargs):
        self.logger.warn("SOCKET ERROR!", args, kwargs)

    def send(self, message: Union[str, dict]):
        # the global emit() knows the right context (i.e. which client to send the message to)
        # while self.socketio.emit() does not work that way - I trust this internet explanation for now.
        emit("message", message)
