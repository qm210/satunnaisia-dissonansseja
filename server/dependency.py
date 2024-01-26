from enum import (
    IntEnum,
    auto,
)
from typing import Dict
from pathlib import Path

class Dependency(IntEnum):
    Nasm = auto()
    Sointu = auto()
    Crinkler = auto()

DependencyUrls: Dict[Dependency, str] = {
    Dependency.Sointu: 'https://github.com/vsariola/sointu/releases/download/v0.3.0/sointu-Windows.zip!sointu-Windows/sointu-compile.exe',
    Dependency.Nasm: 'https://www.nasm.us/pub/nasm/releasebuilds/2.16.01/win64/nasm-2.16.01-win64.zip!nasm-2.16.01/nasm.exe',
    Dependency.Crinkler: 'https://github.com/runestubbe/Crinkler/releases/download/v2.3/crinkler23.zip!crinkler23/Win64/Crinkler.exe',
}
Dependencies: Dict[Dependency, Path] = {}
