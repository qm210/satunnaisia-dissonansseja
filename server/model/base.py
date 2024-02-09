from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):

    def as_dict(self):
        return {
            column.key: getattr(self, column.key)
            for column in self.__table__.columns
        }
