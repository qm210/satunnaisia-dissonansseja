from importlib.resources.abc import Traversable
from typing import Self, List, Dict, Optional

from yaml import safe_load

from server.sointu import templates_path
from server.utils.error import InstrumentFormatError
from server.sointu.unit import Unit
from server.sointu.unit_templates import UnitTemplate


class Instrument:
    def __init__(self: Self, name: str, *units, **kwargs) -> None:
        self.name: str = name
        self.units: List[Unit] = units
        self.numvoices: int = kwargs.get("numvoices", 1)

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

        return Instrument.from_dict(yamlObject)

    @classmethod
    def from_dict(cls, dictionary: dict):
        return cls(
            dictionary['name'],
            *[
                Unit(
                    unitYamlObject['type'],
                    unitYamlObject['id'],
                    unitYamlObject['parameters'],
                    unitYamlObject['varargs'] if 'varargs' in unitYamlObject else None,
                )
                for unitYamlObject in dictionary['units']
            ],
            numvoices=dictionary['numvoices']
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

    def serialize(
            self: Self,
            use_templates: Optional[List[UnitTemplate]] = None,
            for_sointu_yml: bool = False,
    ) -> dict:
        return {
            'name': self.name,
            'numvoices': 1,
            'units': [
                unit
                for unit in [
                    unit.serialize(
                        use_templates=use_templates,
                        params_as_dict=for_sointu_yml
                    )
                    for unit in self.units
                ]
                if unit is not None
            ]
        }


if __name__ == '__main__':
    instrument: Instrument = Instrument.parse_file(templates_path / 'instrument.yml')
    print(instrument.randomize())
