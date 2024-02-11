from typing import (
    Self,
    Dict,
    List,
    Optional,
)
from random import randrange


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
