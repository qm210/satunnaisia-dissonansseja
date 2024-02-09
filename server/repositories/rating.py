import string

from sqlalchemy import and_

from server.model.rating import Rating
from server.model.user import User


def get_user(username: string, session):
    return (
        session.query(User)
        .filter(User.username == username)
        .one_or_none()
    )


class RatingRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def query_rated_by(self, username: string):
        with self.session_factory() as session:
            user = get_user(username, session)
            rated = (
                session.query(Rating)
                .filter(Rating.user_id == user.id)
                .all()
            )
            return rated

    def add_multiple_for_user(self, ratings, username):
        new_ratings = []
        with self.session_factory() as session:
            user = get_user(username, session)
            for rating in ratings:
                (
                    session.query(Rating)
                    .filter(and_(
                        Rating.file == rating["file"],
                        Rating.user_id == user.id
                    ))
                    .delete()
                )
                new_rating = Rating(
                    file=rating["file"],
                    rating=rating["rated"],
                    comment=rating["comment"],
                    user_id=user.id,
                )
                session.add(new_rating)
                new_ratings.append(new_rating)
            session.commit()
            return [rating.id for rating in new_ratings]
