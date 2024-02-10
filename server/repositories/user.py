from datetime import datetime

from server.model.rating import Rating
from server.model.user import User


class UserRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def add(self, username):
        with self.session_factory() as session:
            user = User(username=username)
            session.add(user)
            session.commit()
            return user

    def check_user(self, username):
        with self.session_factory() as session:
            user = (
                session
                .query(User)
                .filter(User.username == username)
                .one_or_none()
            )
            if user is None:
                user = User(username=username)
                session.add(user)
            else:
                user.last_login = datetime.now()
            count_ratings = (
                session
                .query(Rating)
                .filter(Rating.user_id == user.id)
                .count()
            )
            session.commit()
            return {
                **user.as_dict(),
                'count_ratings': count_ratings
            }
