from server.model.instrument_config import InstrumentConfig


class InstrumentConfigRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def get_all(self):
        with self.session_factory() as session:
            configs = (
                session
                .query(InstrumentConfig)
                .all()
            )
            return configs

    def post(self, new_config: InstrumentConfig):
        with self.session_factory() as session:
            result = session.add(new_config)
            session.commit()
        return result
