import string
from datetime import datetime
from typing import List, Optional

from server.model.instrument_config import InstrumentConfig
from server.model.instrument_run import InstrumentRun


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

    def get(self, id: int) -> Optional[InstrumentConfig]:
        with self.session_factory() as session:
            return (
                session
                .query(InstrumentConfig)
                .get(id)
            )

    def upsert(self, config: InstrumentConfig, by: Optional[string] = None):
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
                config.updated_by = by
                session.merge(config)
                result = config
            else:
                config.created_by = by
                result = session.add(config)
            session.commit()
            return result


class InstrumentRunRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def insert(self, entity: InstrumentRun) -> None:
        with self.session_factory() as session:
            session.add(entity)
            session.commit()
            _ = entity.instrument_config  # eager loading
