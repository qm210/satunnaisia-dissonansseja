from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func

from server.model.base import Base


class SointuExecuted(Base):
    __tablename__ = 'sointu_run'

    id = Column(Integer, primary_key=True)
    wav_file = Column(String(255))
    instrument_run_id = Column(Integer, ForeignKey('instrument_run.id'))
    execution_log = Column(String(2000), nullable=True)
    wav_written = Column(Boolean, default=False)
    wav_checked = Column(Boolean, default=False)
    wav_status = Column(String(255), nullable=True)
    sointu_version = Column(String(64), nullable=True)
    executed_at = Column(DateTime, default=func.now())
    executed_by = Column(String(255), nullable=True)
