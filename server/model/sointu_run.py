from enum import Enum

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func, JSON

from server.model.base import Base


class WavStatus(Enum):
    Unfinished = "unfinished..."
    Unchecked = "unchecked..."
    # these are the checked stati:
    EqualsZero = "equals-zero"
    BelowThreshold = "below-threshold"
    Ok = "ok"


class SointuRun(Base):
    __tablename__ = 'sointu_run'

    id = Column(Integer, primary_key=True)
    wav_file = Column(String(255))
    instrument_run_id = Column(Integer, ForeignKey('instrument_run.id'))
    instrument_config = Column(JSON)
    execution_log = Column(String(2000), nullable=True)
    wav_written = Column(Boolean, default=False)
    wav_checked = Column(Boolean, default=False)
    wav_status = Column(String(255), nullable=True)
    sointu_version = Column(String(64), nullable=True)  # TODO: actually write
    executed_at = Column(DateTime, default=func.now())
