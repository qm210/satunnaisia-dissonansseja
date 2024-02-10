from typing import (
    Self,
    Dict,
    List,
    Optional,
)
from yaml import (
    safe_load,
    dump,
)
from random import randrange
from importlib.resources import files
from server import templates
from pathlib import Path

class Unit:
    def __init__(
        self: Self,
        type: str,
        id: int,
        parameters: Dict[str, int],
        varargs: Optional[List[int]] = None,
    ) -> None:
        self.type = type
        self.id = id
        self.parameters = parameters
        self.varargs = varargs

    def randomize(
        self: Self,
        ranges: Dict[str, List[int]] = {},
        exclude: List[str] = ['gain', 'stereo', 'unit', 'target',],
    ) -> dict:
        result = {
            'type': self.type,
            'id': self.id,
            'parameters': {},
        }
        if self.varargs is not None:
            result['varargs'] = self.varargs
        for i in range(len(self.parameters)):
            name, value = list(self.parameters.items())[i]
            if name in exclude:
                result['parameters'][name] = value
            else:
                try:
                    [lo, hi] = ranges[name] if name in ranges.keys() else [0, 128]
                except:
                    lo = 0
                    hi = 128
                result['parameters'][name] = randrange(lo, hi + 1)
        return result
    
    def serialize(
        self: Self,
    ) -> dict:
        result = {
            'type': self.type,
            'id': self.id,
            'parameters': self.parameters,
        }
        if self.varargs is not None:
            result['varargs'] = self.varargs
        return result


class InstrumentFormatError(Exception):
    pass

class Instrument:
    def __init__(self: Self, name: str, *units) -> None:
        self.name: str = name
        self.units: List[Unit] = units

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
                lambda unitIndex: self.units[unitIndex].randomize(ranges[unitIndex] if unitIndex < len(ranges) else None),
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
