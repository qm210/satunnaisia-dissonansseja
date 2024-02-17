import string
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Generator, Optional

from yaml import safe_load, dump

from server.sointu.instrument import Instrument
from server.sointu.sointu import Sointu
from server.sointu.sointu_message import SointuMessage


@dataclass
class TemplatePath:
    instrument: Path
    sequence: Path
    wav_asm: Path

    @classmethod
    def from_config(cls, config: Dict[string, string], root_path: Path):
        template_base = root_path / config["folder"]
        return cls(
            template_base / config["instrument"],
            template_base / config["sequence"],
            template_base / config["asm"]
        )


class SointuService:
    """
    is the service that calls sointu with the given instrument / sequence settings.
    """

    def __init__(self, config, app_path, downloader):
        self.downloader = downloader
        self.app_path = Path(app_path)
        self.template_path = TemplatePath.from_config(config["templates"], self.app_path)
        # <- should throw an error if config is ill-defined
        self.wav_path = self.app_path.parent / Path(config["wav"]["folder"])

    def parse_sequence(self, instrument):
        sequence = safe_load(self.template_path.sequence.read_text())
        sequence['patch'] = [instrument.serialize()] + sequence['patch']
        return sequence

    def run_test_execute(self, filename) -> Generator[string, None, None]:
        instrument = Instrument.parse_file(self.template_path.instrument)
        sequence = self.parse_sequence(instrument)
        wav_data: Optional[bytes] = None
        for message in Sointu.write_wav_file(
                dump(sequence),
                self.downloader.dependencies,
                self.template_path.wav_asm
        ):
            if isinstance(message, SointuMessage.Log):
                yield message.payload
            if isinstance(message, SointuMessage.WavResult):
                wav_data = message.payload
        (self.wav_path / filename).write_bytes(wav_data)
        # return something? -> third type in Generator[..., ..., None]

    # that one is probably not needed anymore. thanks but bye!
    @staticmethod
    def run_some_testing() -> Generator[string, None, None]:
        commands = [["pwd"], ["ls"]]
        for command in commands:
            for message in Sointu.run_and_yield_output(command):
                if isinstance(message, SointuMessage.Log):
                    yield message.payload
                else:
                    print("INTERNAL MESSAGE:", message)
            yield "\n"
