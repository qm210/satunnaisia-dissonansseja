from dataclasses import dataclass
from typing import Optional, Tuple, Union

from server.sointu.unit import Unit, UnitParam
from server.sointu.unit_templates import UnitParamTemplate


@dataclass
class ParamConfig:
    param_name: str
    unit_id: int
    unit_type: str
    value: int
    range: Optional[Tuple[int, int]] = None

    @classmethod
    def parse(cls, unit: Union[Unit, dict], param: Union[UnitParam, dict], **kwargs):
        if isinstance(unit, Unit):
            unit_id = unit.id
            unit_type = unit.type
        else:
            unit_id = unit['id']
            unit_type = unit['type']
        if isinstance(param, UnitParam):
            return ParamConfig(
                unit_id=unit_id,
                unit_type=unit_type,
                param_name=param.name,
                value=param.value,
                range=param.range
            )
        else:
            ParamConfig(
                unit_id=unit_id,
                unit_type=unit_type,
                param_name=param['name'],
                value=param['value'],
                range=param.get('range')
            )

    @classmethod
    def from_json(cls, json: dict):
        # for now, this shall explicitly raise an Error if anything is not defined
        return cls(
            unit_id=json['unitId'],
            unit_type=json['unitType'],
            param_name=json['paramName'],
            value=json['value'],
            range=json['range'],
        )


class ParamConfigWithTemplate(ParamConfig):
    template: UnitParamTemplate
    original_value: int
    original_range: Optional[Tuple[int, int]]

    def __init__(self, unit_id, unit_type, param_name, value, range, template, original_value=None,
                 original_range=None):
        self.unit_id = unit_id
        self.unit_type = unit_type
        self.param_name = param_name
        self.value = value
        self.range = range
        self.template = template
        self.original_value = original_value if original_value is not None else value
        self.original_range = original_range if original_range is not None else range

    @classmethod
    def parse_from(cls, unit, param, template: UnitParamTemplate, **kwargs):
        base = ParamConfig.parse(unit, param)
        return cls(
            unit_id=base.unit_id,
            unit_type=base.unit_type,
            param_name=base.param_name,
            value=base.value,
            range=base.range,
            template=template,
            original_value=kwargs.get('original_value'),
            original_range=kwargs.get('original_range')
        )

    @classmethod
    def from_json(cls, json: dict):
        return cls(
            unit_id=json['unitId'],
            unit_type=json['unitType'],
            param_name=json['paramName'],
            value=json['value'],
            range=json['range'],
            template=json['template'],
            original_value=json.get('originalValue'),
            original_range=json.get('originalRange'),
        )
