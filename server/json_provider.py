from re import sub

from flask.json.provider import DefaultJSONProvider


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
        from server.model.param_config import ParamConfigWithTemplate
        from server.sointu.unit_templates import (
            UnitParamFixed, UnitParamFixedSpecial, UnitParamFixedBool, UnitParamTemplate
        )

        result = None

        if hasattr(obj, 'serialize'):
            result = obj.serialize()

        # the default provider will strip away fields of extended custom classes, i.e. deal with these first, explicitly
        extended = {}
        if isinstance(obj, ParamConfigWithTemplate):
            extended["template"] = JsonProvider.default(obj.template)
            extended["originalValue"] = obj.original_value
            extended["originalRange"] = obj.original_range

        if result is None:
            result = DefaultJSONProvider.default(obj)

        for key in extended:
            result[key] = extended[key]

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
