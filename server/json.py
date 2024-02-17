from flask.json.provider import DefaultJSONProvider

from server.sointu.instrument import Instrument
from server.sointu.unit import Unit


class JsonProvider(DefaultJSONProvider):
    @staticmethod
    def default(obj):
        if isinstance(obj, Instrument):
            return obj.serialize()
        if isinstance(obj, Unit):
            return obj.serialize()
        return DefaultJSONProvider.default(obj)
