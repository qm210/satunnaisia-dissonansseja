import string
from dataclasses import dataclass
from importlib.resources import files
from pathlib import Path
from typing import Dict

from yaml import safe_load, dump

from server import templates
from server.sointu.instrument import Instrument
from server.sointu.sointu import Sointu


@dataclass
class TemplatePath:
    instrument: Path
    sequence: Path
    asm: Path

    @classmethod
    def from_config(cls, config: Dict[string, string], root_path: string):
        template_base = Path(root_path) / config["folder"]
        return cls(
            template_base / config["instrument"],
            template_base / config["sequence"],
            template_base / config["asm"]
        )


class SointuService:
    def __init__(self, config, root_path, downloader):
        self.downloader = downloader
        self.template_path = TemplatePath.from_config(config["templates"], root_path)
        # <- should throw an error if config is ill-defined
        self.wav_path = Path(root_path).parent / Path(config["wav"]["folder"])
        # will be removed:
        self.test_wav_path = self.wav_path / config["wav"]["test_wav"]

    def parse_sequence(self, instrument):
        sequence = safe_load(self.template_path.sequence.read_text())
        sequence['patch'] = [instrument.serialize()] + sequence['patch']
        return sequence

    def write_test(self):
        instrument = Instrument.parse_file(self.template_path.instrument)
        sequence = self.parse_sequence(instrument)
        wav_data = Sointu.yamlToWave(
            dump(sequence),
            self.downloader.dependencies
        )
        self.test_wav_path.write_bytes(wav_data)
        return sequence
