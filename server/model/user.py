from sqlalchemy import Column, Integer, String, DateTime, func

from server.model.base import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    last_login = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<User {self.username} ({self.id})>"
