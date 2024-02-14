from importlib.resources.abc import Traversable
from typing import Self, List, Dict, Optional

from yaml import safe_load

from server.sointu import templates_path
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

        if 'name' not in yamlObject:
            raise InstrumentFormatError('Instrument YAML does not contain a `name` property.')

        if 'units' not in yamlObject:
            raise InstrumentFormatError('Instrument YAML does not contain a `units` property.')

        return cls(
            yamlObject['name'],
            *[
                Unit(
                    unitYamlObject['type'],
                    unitYamlObject['id'],
                    unitYamlObject['parameters'],
                    unitYamlObject['varargs'] if 'varargs' in unitYamlObject else None,
                )
                for unitYamlObject in yamlObject['units']
            ]
        )

    def randomize(
            self: Self,
            ranges: Optional[List[Dict[str, List[int]]]] = None,
    ) -> dict:
        n_ranges = len(ranges or [])
        return {
            'name': self.name,
            'numvoices': 1,
            'units': [
                unit.randomize(
                    ranges[u] if u < n_ranges else None
                )
                for u, unit in enumerate(self.units)
            ]
        }

    def serialize(self: Self) -> dict:
        return {
            'name': self.name,
            'numvoices': 1,
            'units': [
                unit.serialize()
                for unit in self.units
            ]
        }


if __name__ == '__main__':
    instrument: Instrument = Instrument.parse_file(templates_path / 'instrument.yml')
    print(instrument.randomize())
