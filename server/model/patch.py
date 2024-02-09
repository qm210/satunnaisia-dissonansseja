from sqlalchemy import Column, Integer, String

from server.model.base import Base


class Patch(Base):
    __tablename__ = 'patches'

    # fields...
    # - original YAML
    # - configurable parameters
    # --- their randomize intervals
