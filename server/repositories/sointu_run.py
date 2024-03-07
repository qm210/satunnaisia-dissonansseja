from pathlib import Path
from typing import Union, List

from server.model.sointu_run import SointuRun, WavStatus


class SointuRunRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def count_finished_for_instrument_run(self, instrument_run_id: int) -> List[SointuRun]:
        with self.session_factory() as session:
            return (
                session
                .query(SointuRun)
                .filter(SointuRun.instrument_run_id == instrument_run_id)
                .filter(SointuRun.wav_written)
                .count()
            )

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

    def update_written(self, id: int, is_written: bool = True, wav_filename: Union[str, Path] = ""):
        with self.session_factory() as session:
            entity = session.query(SointuRun).get(id)
            entity.wav_written = is_written
            entity.wav_status = WavStatus.Unchecked.value
            if wav_filename:
                entity.wav_file = str(wav_filename)
            session.commit()

    def update_checked(self, id: int, wav_status: WavStatus):
        with self.session_factory() as session:
            entity = session.query(SointuRun).get(id)
            if not entity.wav_written:
                raise ValueError("Cannot update_checked() a SointuRun with no wav_written!")
            entity.wav_checked = True
            entity.wav_status = wav_status.value
            session.commit()
