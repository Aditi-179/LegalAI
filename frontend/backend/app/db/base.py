from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so SQLAlchemy metadata is populated before create_all runs.
from app import models  # noqa: E402,F401
