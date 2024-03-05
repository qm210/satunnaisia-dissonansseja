import string
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from random import randint
from shutil import move
from typing import Generator, Optional

from yaml import safe_load

from server.model.instrument_run import InstrumentRun
from server.sointu.instrument import Instrument
from server.sointu.sointu import Sointu
from server.sointu.sointu_message import SointuMessage
from server.utils.dataclasses import TemplatePath


class SointuService:
    """
    is the service that calls sointu with the given instrument / sequence settings.
    """

    def __init__(
            self,
            config,
            app,
            downloader,
            process_service,
            instruments_service,
            sointu_run_repository,
    ):
        self.app = app
        self.logger = app.logger
        self.downloader = downloader
        self.process_service = process_service
        self.instruments_service = instruments_service
        self.sointu_run_repository = sointu_run_repository

        root_path = Path(app.root_path).parent
        self.template_path = TemplatePath.from_config(config["templates"], root_path)
        self.wav_path = root_path / Path(config["wav"]["folder"])

        self.base_sequence = safe_load(self.template_path.sequence.read_text())

    def create_sequence(self, instrument: Instrument, note: Optional[int] = None):
        sequence = deepcopy(self.base_sequence)
        sequence['patch'] = [instrument.serialize(for_sointu_yml=True)] + sequence['patch']
        if len(sequence['score']['tracks']) != 1:
            raise ValueError("Sequence must contain exactly one track!")
        track = sequence['score']['tracks'][0]
        if note is not None:
            track['patterns'] = [[note, 0]]  # todo: find out what the 0 is for
        # todo: take sample_seconds and set sequence['bpm'] accordingly
        return sequence

    def run_test_execute(self, filename) -> Generator[string, None, None]:
        instrument = Instrument.parse_file(self.template_path.test_instrument)
        sequence = self.create_sequence(instrument)
        wav_data: Optional[bytes] = None
        for message in Sointu.write_wav_file(
                sequence,
                self.downloader.dependencies,
                self.template_path.wav_asm
        ):
            if isinstance(message, SointuMessage.Log):
                yield message.payload
            if isinstance(message, SointuMessage.WavResult):
                wav_data = message.payload
        (self.wav_path / filename).write_bytes(wav_data)
        # return something? -> third type in Generator[..., ..., None]

    def initiate_run(self, run_json):
        instrument_run = self.instruments_service.prepare_run(run_json)
        instrument = self.instruments_service.spawn_instrument(instrument_run)

        for sample in range(instrument_run.sample_size):
            self.logger.debug(f"Initiate Run {sample}")
            note = self.draw_random_note(instrument_run)
            sequence = self.create_sequence(instrument, note=note)
            self.initiate_sointu_run(sequence, instrument_run, sample)

        return instrument_run.id

    def finalize_sointu_run(self, temp_wav_file: Path, final_wav_file: Path, run_id: int):
        self.logger.debug(f"finalize sointu run, {temp_wav_file} -> {final_wav_file}")

        is_written = temp_wav_file.exists()
        self.logger.debug(f"file written? {is_written}")
        if is_written:
            final_wav_file.parent.mkdir(parents=True, exist_ok=True)
            move(temp_wav_file, final_wav_file)
        self.sointu_run_repository.update_written(run_id, is_written, final_wav_file)

    def initiate_sointu_run(self, sequence: dict, instrument_run: InstrumentRun, sample_index: int) -> None:
        sample_size = str(instrument_run.sample_size)
        padded_index = str(sample_index).zfill(len(sample_size))
        run_folder = f"run{instrument_run.id}_{datetime.now().strftime('%Y%m%d_%H%M')}_{sample_size}"

        final_wav_file = self.wav_path / run_folder / f"{padded_index}.wav"
        self.logger.debug(f"prepare wav writing - for {final_wav_file}")
        commands, temp_wav_file = Sointu.prepare_wav_writing(
            sequence,
            self.app.temp_path,
            self.downloader.dependencies,
            self.template_path.wav_asm,
            f"-run{instrument_run.id}-{padded_index}"
        )

        run_id = self.sointu_run_repository.insert_new(temp_wav_file, instrument_run.id)
        self.process_service.run(
            commands,
            callback=self.finalize_sointu_run,
            callback_args=(temp_wav_file, final_wav_file, run_id)
        )

        # steps are planned as:
        # - write params config to new yaml
        # - compile run command for the sointu run
        # - let process_service start a single run - with Popen?
        # --- first write a stub entry in sointu_run()
        # --- callback after run: update stub, check if file is there, mark as finished
        # - send message via socket: "file finished" and "this is ...% of the run "bla"
        # - also, update instrument run entry (how many files are written, how many left to go?)
        # - measure CPU performance before and during run, log in DB
        # - startup routine of server, is there some run to continue?

    @staticmethod
    def draw_random_note(instrument_run):
        lower = instrument_run.note_lower
        upper = instrument_run.note_upper
        if upper is None:
            return lower
        return randint(lower, upper)
