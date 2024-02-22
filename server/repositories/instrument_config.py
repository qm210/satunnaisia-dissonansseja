from datetime import datetime
from typing import List

from server.model.instrument_config import InstrumentConfig


class InstrumentConfigRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def get_all(self) -> List[InstrumentConfig]:
        with self.session_factory() as session:
            configs = (
                session
                .query(InstrumentConfig)
                .all()
            )
            return configs

    def upsert(self, config: InstrumentConfig):
        # TODO actually UPSERT, for now this is only a INSERT ;)
        with self.session_factory() as session:
            entry_with_same_hash = (
                session
                .query(InstrumentConfig)
                .filter_by(base_yml_hash=config.base_yml_hash)
                .first()
            )
            if entry_with_same_hash:
                config.id = entry_with_same_hash.id
                config.updated_at = datetime.now()
                config.updated_by = "eumelking24"  # just a quick test whether that lands there
                session.merge(config)
                result = config
            else:
                result = session.add(config)
            session.commit()
            return result
