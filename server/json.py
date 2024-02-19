from re import sub

from flask.json.provider import DefaultJSONProvider

from server.model.instrument_config import ParamConfig, ParamConfigWithTemplate
from server.sointu.instrument import Instrument
from server.sointu.unit import Unit
from server.sointu.unit_templates import UnitParamFixed, UnitParamFixedSpecial, UnitParamFixedBool, UnitParamTemplate


def with_dict_in_camel_case(obj):
    if isinstance(obj, list):
        return [with_dict_in_camel_case(item) for item in obj]
    if not isinstance(obj, dict):
        return obj

    result = {}
    for key, value in obj.items():
        camel_key = sub(r'_([a-z])', lambda m: m.group(1).upper(), key)
        result[camel_key] = with_dict_in_camel_case(value)
    return result


class JsonProvider(DefaultJSONProvider):
    @staticmethod
    def default(obj):
        if isinstance(obj, Instrument):
            return obj.serialize()
        if isinstance(obj, Unit):
            return obj.serialize()

        # the default provider will strip away nested custom classes, i.e. deal with these first, explicitly
        nested_objects = {}
        if isinstance(obj, ParamConfigWithTemplate):
            nested_objects["template"] = JsonProvider.default(obj.template)

        result = DefaultJSONProvider.default(obj)

        for key in nested_objects:
            result[key] = nested_objects[key]

        # don't really get why Python would just let me override the class definitions, but anyway.
        if isinstance(obj, UnitParamTemplate):
            result['fixed'] = False
        if isinstance(obj, UnitParamFixed):
            result['fixed'] = True
        if isinstance(obj, UnitParamFixedBool):
            result['max'] = 1
        if isinstance(obj, UnitParamFixedSpecial):
            result['special'] = True

        return with_dict_in_camel_case(result)
