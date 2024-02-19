from dataclasses import dataclass
from typing import (
    Self,
    Dict,
    List,
    Optional, Union, Tuple,
)
from random import randrange


@dataclass
class UnitParam:
    name: str
    value: int
    range: Optional[Tuple[int]] = None  # don't care for now


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
            params_from_original_values=False
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
            # if given a List, this might come from the client, therefore hold the "originalValue", also "range"
            value_key = "value" if not params_from_original_values else "originalValue"
            self.parameters = [
                UnitParam(param['name'], param[value_key], param.get('range'))
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
    ) -> dict:
        result = {
            'type': self.type,
            'id': self.id,
            'parameters': self.parameters,
        }
        if self.varargs is not None:
            result['varargs'] = self.varargs
        return result
