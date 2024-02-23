from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, func, JSON, ForeignKey, Text

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
