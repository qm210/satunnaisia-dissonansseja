import string
from dataclasses import dataclass
from typing import Union


@dataclass
class Message:
    payload: Union[string, bytes, int]

    def __init__(self, payload: Union[string, bytes, int]):
        self.payload = payload

    def __str__(self):
        return str(self.payload)


class SointuMessage:
    class Log(Message):
        def __init__(self, payload: string):
            super().__init__(payload)

    class RunReturnCode(Message):
        def __init__(self, payload: int):
            super().__init__(payload)

        def __eq__(self, other):
            if isinstance(other, SointuMessage.RunReturnCode):
                return self.payload == other.payload
            return self.payload == other

    class WavResult(Message):
        def __init__(self, payload: bytes):
            super().__init__(payload)

        def __str__(self):
            return ''.join(str(byte) for byte in self.payload)
