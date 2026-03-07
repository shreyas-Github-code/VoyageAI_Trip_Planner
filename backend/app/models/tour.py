import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Tour(Base):
    __tablename__ = "tours"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_location: Mapped[str] = mapped_column(String(100), nullable=False)
    to_location: Mapped[str] = mapped_column(String(100), nullable=False)
    interests: Mapped[str] = mapped_column(String(200), nullable=False)
    suggestions: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
    )


class TourOption(Base):
    __tablename__ = "tour_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_location: Mapped[str] = mapped_column(String(100), nullable=False)
    to_location: Mapped[str] = mapped_column(String(100), nullable=False)
    options_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
    )


class TourItinerary(Base):
    __tablename__ = "tour_itineraries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_location: Mapped[str] = mapped_column(String(100), nullable=False)
    to_location: Mapped[str] = mapped_column(String(100), nullable=False)
    num_days: Mapped[int] = mapped_column(Integer, nullable=False)
    selected_places: Mapped[str] = mapped_column(Text, nullable=False)
    itinerary_plan: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
    )
