from __future__ import annotations

import datetime

from pydantic import BaseModel, ConfigDict, Field


class TourRequest(BaseModel):
    from_location: str = Field(min_length=1)
    to_location: str = Field(min_length=1)
    interests: str = "general sightseeing"


class TourResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_location: str
    to_location: str
    interests: str
    suggestions: str
    created_at: datetime.datetime


class OptionPlace(BaseModel):
    name: str
    description: str
    priority: str | None = None
    category: str
    estimated_time: str


class TourOptionsResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    low_priority: list[OptionPlace]
    mid_priority: list[OptionPlace]
    high_priority: list[OptionPlace]
    created_at: datetime.datetime


class TourOptionsDetailResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    options: dict[str, list[OptionPlace]]
    created_at: datetime.datetime


class ItineraryRequest(BaseModel):
    from_location: str = Field(min_length=1)
    to_location: str = Field(min_length=1)
    num_days: int = Field(ge=1)
    selected_places: list[str] = Field(min_length=1)


class DayPlan(BaseModel):
    day: int
    places: list[str]
    transport_details: list[str]
    timing: list[str]
    notes: str


class ItineraryResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    num_days: int
    day_plans: list[DayPlan]
    created_at: datetime.datetime


class ItineraryDetailResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    num_days: int
    selected_places: str
    itinerary: dict[str, list[DayPlan]]
    created_at: datetime.datetime
