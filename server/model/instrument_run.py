from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, func, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship

from server.model.base import Base


class InstrumentRun(Base):
    """
    When you send an InstrumentConfig to Sointu to execute several trillion times,
    the current settings are saved again for later reference.

    Note also the SointuRun model where any executed single wav file is referenced
    """

    __tablename__ = 'instrument_run'

    id = Column(Integer, primary_key=True)
    status = Column(String(255), nullable=True)
    instrument_config_id = Column(Integer, ForeignKey('instrument_config.id'))
    log = Column(Text)

    # spontaneous param override
    params_config = Column(JSON, nullable=True)
    note_lower = Column(Integer, nullable=True)
    note_upper = Column(Integer, nullable=True)
    sample_seconds = Column(DECIMAL(6, 3))
    sample_size = Column(Integer)

    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    created_by = Column(Integer, nullable=True)  # not really required, thus not linked by ForeignKey(users.id)

    instrument_config = relationship('InstrumentConfig')  # backref="instrument_run"

    _DEFAULT_MIDI_NOTE = 60
    _DEFAULT_SAMPLE_SECONDS = 2.1
    _DEFAULT_SAMPLE_SIZE = 3

    @classmethod
    def from_json(cls, json, status=None):
        result = cls(
            status=status,
            instrument_config_id=json['id'],
            params_config=json['paramsConfig'],
            note_lower=json.get('noteLower'),
            note_upper=json.get('noteUpper'),
            sample_seconds=json.get('sampleSeconds'),
            sample_size=json.get('sampleSize'),
            comment=json['comment'],
            created_by=json.get('username')
        )
        if result.note_lower is None:
            result.note_lower = cls._DEFAULT_MIDI_NOTE
        if result.note_upper is None:
            result.note_upper = result.note_lower
        if result.sample_seconds is None:
            result.sample_seconds = cls._DEFAULT_SAMPLE_SECONDS
        if result.sample_size is None:
            result.sample_size = cls._DEFAULT_SAMPLE_SIZE
        return result
