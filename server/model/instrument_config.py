from typing import List, Union

from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, func, JSON

from server.model.base import Base
from server.model.param_config import ParamConfig, ParamConfigWithTemplate
from server.sointu.instrument import Instrument
from server.sointu.unit import Unit


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
    base_yml_hash = Column(String(255), nullable=False)
    base_instrument = Column(JSON, nullable=False)  # contains the stack / unit definition
    params_config = Column(JSON, nullable=True)  # contains what was configured on client

    # TODO only nullable for now, until these are implemented...
    note_lower = Column(Integer, nullable=True)  # play one note from this ...
    note_upper = Column(Integer, nullable=True)  # ... to this MIDI note value
    sample_seconds = Column(DECIMAL(6, 3), nullable=False)

    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    created_by = Column(Integer, nullable=True)  # not really required, thus not linked by ForeignKey(users.id)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(Integer, nullable=True)  # cf. created_by

    def serialize(self):
        return {
            "id": self.id if self.id is not None else self.base_yml_hash,
            "name": self.name,
            "baseYmlFilename": self.base_yml_filename,
            "baseYmlHash": self.base_yml_hash,
            "baseInstrument": self.base_instrument,
            "paramsConfig": self.params_config,
            "noteLower": self.note_lower,
            "noteUpper": self.note_upper,
            "sampleSeconds": self.sample_seconds,
            "comment": self.comment,
            "updatedAt": self.updated_at or self.created_at,
            "updatedBy": self.updated_by or self.created_by
        }

    @classmethod
    def from_json(cls, body: dict, keep_params_configs: bool = False):
        base_instrument = Instrument.from_dict(
            body['baseInstrument'],
        )
        params_config = \
            InstrumentConfig.as_simple_params_config_json(
                body['paramsConfig'],
                keep_params_configs=keep_params_configs
            )

        # TODO: work in progress
        sample_seconds = 210e-2

        return cls(
            name=body.get('name', body['baseInstrument']['name']),
            base_yml_filename=body['baseYmlFilename'],
            base_yml_hash=body['baseYmlHash'],
            base_instrument=base_instrument.serialize(),
            params_config=params_config,
            sample_seconds=sample_seconds
        )

    @staticmethod
    def as_simple_params_config_json(params: Union[List[dict]], keep_params_configs: bool = False):
        result = []
        for param in params:
            if keep_params_configs:
                param_config = param
            else:
                param_class = (ParamConfig
                               if param.get('template') is None
                               else ParamConfigWithTemplate)
                param_config = param_class.from_json(param)
            result.append(param_config.__dict__)
        return result

    @staticmethod
    def as_params_config(units: List[Unit]):
        return [
            ParamConfig.parse(unit, param)
            for unit in units
            for param in unit.parameters
        ]
