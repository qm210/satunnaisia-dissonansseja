from importlib.resources import files
from importlib.resources.abc import Traversable
from pathlib import Path
from typing import Self, List, Dict

from yaml import safe_load

from server import templates
from server.sointu.error import InstrumentFormatError
from server.sointu.unit import Unit


class Instrument:
    def __init__(self: Self, name: str, *units) -> None:
        self.name: str = name
        self.units: List[Unit] = units

    @classmethod
    def parse_file(cls: Self, file: Traversable) -> Self:
        return cls.parse(file.read_text())

    @classmethod
    def parse(cls: Self, yaml: str) -> Self:
        yamlObject: dict = safe_load(yaml)

        if not 'name' in yamlObject:
            raise InstrumentFormatError('Instrument YAML does not contain a `name` property.')

        if not 'units' in yamlObject:
            raise InstrumentFormatError('Instrument YAML does not contain a `units` property.')

        return cls(yamlObject['name'], *list(map(
            lambda unitYamlObject: Unit(
                unitYamlObject['type'],
                unitYamlObject['id'],
                unitYamlObject['parameters'],
                unitYamlObject['varargs'] if 'varargs' in unitYamlObject else None,
            ),
            yamlObject['units'],
        )))

    def randomize(
            self: Self,
            ranges: List[Dict[str, List[int]]] = [],
    ) -> dict:
        return {
            'name': self.name,
            'numvoices': 1,
            'units': list(map(
                lambda unitIndex: self.units[unitIndex].randomize(
                    ranges[unitIndex] if unitIndex < len(ranges) else None),
                range(len(self.units)),
            )),
        }

    def serialize(self: Self) -> dict:
        return {
            'name': self.name,
            'numvoices': 1,
            'units': list(map(
                lambda unitIndex: self.units[unitIndex].serialize(),
                range(len(self.units)),
            )),
        }


if __name__ == '__main__':
    instrument: Instrument = Instrument.parse(Path(files(templates) / 'instrument.yml').read_text())
    print(instrument.randomize())
