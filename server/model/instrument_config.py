from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime, func

from server.model.base import Base
from server.sointu.instrument import Instrument


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
    yml_filename = Column(String(255), nullable=True)  # just for reference (but file can be deleted etc. later)
    yml_instrument = Column(Text, nullable=False)  # contains the stack / unit definition
    params_config = Column(Text, nullable=True)  # contains what was configured on client

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
        params_config = [
            {
                'unit_id': unit['id'],
                'unit_type': unit['type'],
                'param_name': param['name'],
                'value': param['value'],
                'range': param['range'],
            }
            for unit in body['instrument']['units']
            for param in unit['parameters']
            if not param.get('template', {}).get('fixed', False)
        ]

        # TODO: work in progress
        
        return cls(
            name=body['instrument']['name'],
            yml_filename=body['file'],
            yml_instrument=base_instrument.serialize(),
            params_config=params_config,
        )
