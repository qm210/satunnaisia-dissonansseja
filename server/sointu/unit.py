from dataclasses import dataclass
from typing import (
    Self,
    Dict,
    List,
    Optional, Union, Tuple,
)
from random import randrange

from server.sointu.unit_templates import UnitTemplate


@dataclass
class UnitParam:
    name: str
    value: int
    range: Optional[Tuple[int]] = None


class Unit:
    type: str
    id: int
    parameters: List[UnitParam]
    varargs: Optional[List[int]]

    def __init__(
            self: Self,
            unit_type: str,
            id: int,
            parameters: Union[Dict[str, int], List[Dict[str, int]]],
            varargs: Optional[List[int]] = None,
    ) -> None:
        self.type = unit_type
        self.id = id
        self.varargs = varargs

        if type(parameters) is dict:
            self.parameters = [
                UnitParam(name, value)
                for name, value in parameters.items()
            ]
        elif type(parameters) is list:
            self.parameters = [
                UnitParam(**param)
                for param in parameters
            ]
        else:
            raise TypeError("Unit Parameters not given in any known format.")

    def get_parameter(self, name: str) -> Optional[int]:
        return next(
            (param for param in self.parameters if param.name == name),
            None
        )

    def randomize(
            self: Self,
            ranges: Dict[str, List[int]] = {},
            exclude: List[str] = ['gain', 'stereo', 'unit', 'target', ],
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
            use_templates: Optional[List[UnitTemplate]] = None
    ) -> Optional[dict]:
        result = {
            'type': self.type,
            'id': self.id,
            'parameters': self.parameters,
        }
        if self.varargs is not None:
            result['varargs'] = self.varargs

        # with the use_templates kwarg you can check for validity
        if use_templates is not None:
            template = next(
                (
                    template
                    for template in use_templates
                    if template.name == self.type
                ),
                None
            )
            if template is None:
                return None
            result['parameters'] = []
            for expected_param_name in template.all_params:
                found = next((p for p in self.parameters if p.name == expected_param_name), None)
                if found:
                    result['parameters'].append(found)

        # fully serialize
        result['parameters'] = [
            {
                'name': param.name,
                'value': param.value,
            }
            for param in result['parameters']
        ]

        return result
