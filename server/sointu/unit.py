from typing import (
    Self,
    Dict,
    List,
    Optional, Union,
)
from random import randrange


class Unit:
    type: str
    id: int
    parameters: Dict[str, int]
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
            self.parameters = parameters
        elif type(parameters) is list:
            # if given a List, this comes from the client and can hold "value" and/or "originalValue"
            value_key = "value" if not params_from_original_values else "originalValue"
            self.parameters = {
                param['name']: param[value_key]
                for param in parameters
            }
            # TODO: in these objects, there might also exist the "range"
            # --> can takek a random value right from here.
        else:
            raise TypeError("Unit Parameters not given in any known format.")

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
