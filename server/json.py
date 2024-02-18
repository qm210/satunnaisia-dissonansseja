from flask.json.provider import DefaultJSONProvider

from server.sointu.instrument import Instrument
from server.sointu.unit import Unit
from server.sointu.unit_templates import UnitParamFixed, UnitParamFixedSpecial, UnitParamFixedBool, UnitParamTemplate


class JsonProvider(DefaultJSONProvider):
    @staticmethod
    def default(obj):
        if isinstance(obj, Instrument):
            return obj.serialize()
        if isinstance(obj, Unit):
            return obj.serialize()

        result = DefaultJSONProvider.default(obj)

        # don't really get why Python would just let me override the class definitions, but anyway.
        if isinstance(obj, UnitParamTemplate):
            result['fixed'] = False
        if isinstance(obj, UnitParamFixed):
            result['fixed'] = True
        if isinstance(obj, UnitParamFixedBool):
            result['max'] = 1
        if isinstance(obj, UnitParamFixedSpecial):
            result['special'] = True

        return result
