class SocketService:
    def __init__(self, socketio, logger):
        self.socketio = socketio
        self.logger = logger

    def on_connect(self, *args, **kwargs):
        self.logger.info("socket connected", args, kwargs)

    def on_disconnect(self, *args, **kwargs):
        self.logger.info("socket disconnectöd", args, kwargs)

    def on_message(self, *args, **kwargs):
        self.logger.info("socket message!", args, kwargs)

    def on_error(self, *args, **kwargs):
        self.logger.warn("SOCKET ERROR!", args, kwargs)

    def send(self, event, message):
        self.socketio.emit(event, message)
