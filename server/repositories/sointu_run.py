from pathlib import Path
from typing import Union

from server.model.sointu_run import SointuRun, WavStatus


class SessionFactoryManager:
    def __init__(self, app, **kwargs):
        self.app = app

    def __enter__(self, use_factory: bool = True):
        pass

    def __exit__(self):
        pass


class SointuRunRepository:
    def __init__(self, session_factory, app, db):
        self.session_factory = session_factory
        self.app = app
        self.session_manager = lambda kwargs: SessionFactoryManager(app, **kwargs)
        self.db = db

    def insert(self, entity: SointuRun) -> int:
        with self.session_factory() as session:
            session.add(entity)
            session.commit()
            return entity.id

    def insert_new(self, wav_file: Union[str, Path], instrument_run_id: int) -> int:
        sointu_run = SointuRun(
            wav_file=str(wav_file),
            instrument_run_id=instrument_run_id,
            execution_log=f"Started {wav_file}.\n",
            wav_status=WavStatus.Unfinished.value
        )
        return self.insert(sointu_run)

    def update_written(self, id: int, is_written: bool = True):
        with self.session_factory() as session:
            entity = session.query(SointuRun).get(id)
            entity.wav_written = is_written
            entity.wav_status = WavStatus.Unchecked.value
            session.commit()
