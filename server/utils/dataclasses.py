import string
from dataclasses import dataclass
from pathlib import Path
from typing import Dict


@dataclass
class TemplatePath:
    test_instrument: Path
    sequence: Path
    wav_asm: Path

    @classmethod
    def from_config(cls, config: Dict[string, string], root_path: Path):
        template_base = root_path / config["folder"]
        return cls(
            template_base / config["test_instrument"],
            template_base / config["sequence"],
            template_base / config["asm"]
        )
