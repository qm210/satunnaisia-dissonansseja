from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from server.model.base import Base


class Rating(Base):
    __tablename__ = 'ratings'

    id = Column(Integer, primary_key=True)
    file = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    comment = Column(String(255), nullable=True)

    user = relationship("User", backref="ratings")

    def __repr__(self):
        return f"<Rating {self.user_id}/{self.file}: {self.rating}>"
