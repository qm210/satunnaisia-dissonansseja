from dataclasses import dataclass
from typing import List, Optional, Tuple, Union

from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, func, JSON

from server.model.base import Base
from server.sointu.instrument import Instrument
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


class ParamConfigWithTemplate(ParamConfig):
    template: UnitParamTemplate
    original_value: int

    def __init__(self, unit, param, template: UnitParamTemplate, **kwargs):
        base = ParamConfig.parse(unit, param)
        self.unit_id = base.unit_id
        self.unit_type = base.unit_type
        self.param_name = base.param_name
        self.value = base.value
        self.range = base.range
        self.template = template
        self.original_value = kwargs.get('original_value', base.value)


class InstrumentConfig(Base):
    """
    While the Instrument class is what describes a single given .YML as taken from Sointu,
    the InstrumentConfig is

    i.e. this uses the Instrument as a base and adds all the parameters that we want
    to randomize during a given run, which are at least
    - all the units / parameters with their configured ranges
    - the single note to be played, whether fixed or randomized (not yet implemented)
    - sample length (not yet implemented)

    So to start a Satunnaisia Run, you choose
    - an InstrumentConfig,
    - a number of samples
    - maybe some quality parameters / samplerate / I don't know...
    --> then run
    """

    __tablename__ = 'instrument_config'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    base_yml_filename = Column(String(255), nullable=True)  # just for reference (but file can be deleted etc. later)
    base_instrument = Column(JSON, nullable=False)  # contains the stack / unit definition
    params_config = Column(JSON, nullable=True)  # contains what was configured on client

    # TODO only nullable for now, until these are implemented...
    note_lower = Column(Integer, nullable=True)  # play one note from this ...
    note_upper = Column(Integer, nullable=True)  # ... to this MIDI note value
    sample_seconds = Column(DECIMAL(6, 3), nullable=False)

    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    created_by = Column(Integer, nullable=True)  # not really required, thus not linked by ForeignKey(users.id)
    updated_at = Column(DateTime, default=func.now())
    updated_by = Column(Integer, nullable=True)  # cf. created_by

    @classmethod
    def from_json(cls, body):
        base_instrument = Instrument.from_dict(
            body['instrument'],
            params_from_original_values=True
        )
        params_config = \
            InstrumentConfig.as_params_config_from_json(body['instrument']['units'])

        # TODO: work in progress
        sample_seconds = 210e-2

        return cls(
            name=body['instrument']['name'],
            base_yml_filename=body['file'],
            base_instrument=base_instrument.serialize(),
            params_config=params_config,
            sample_seconds=sample_seconds
        )

    @staticmethod
    def as_params_config_from_json(units: List[dict]):
        return [
            ParamConfig.parse(unit, param).__dict__
            for unit in units
            for param in unit['parameters']
            if not param.get('template', {}).get('fixed', False)
        ]

    @staticmethod
    def as_params_config(units: List[Unit]):
        return [
            ParamConfig.parse(unit, param)
            for unit in units
            for param in unit.parameters
        ]
