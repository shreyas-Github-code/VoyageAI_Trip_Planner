from __future__ import annotations

import datetime
import json
import logging

from groq import Groq

from app.core.config import settings
from app.schemas.tour import ItineraryRequest, TourRequest

logger = logging.getLogger(__name__)


class TourServiceError(Exception):
    pass


def _now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _normalize_location(value: str, field_name: str) -> str:
    cleaned_value = value.strip()
    if not cleaned_value:
        raise ValueError(f"{field_name} cannot be empty")
    return cleaned_value


def _ensure_distinct_locations(from_location: str, to_location: str) -> None:
    if from_location.casefold() == to_location.casefold():
        raise ValueError("From and To locations cannot be the same city")


def _get_client() -> Groq:
    if not settings.groq_api_key:
        raise TourServiceError("Missing GROQ_API_KEY in backend/.env")
    return Groq(api_key=settings.groq_api_key)


def _extract_json_object(raw_text: str) -> dict:
    cleaned_text = raw_text.strip()

    if cleaned_text.startswith("```"):
        parts = cleaned_text.split("```")
        if len(parts) >= 2:
            cleaned_text = parts[1].removeprefix("json").strip()

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse model response as JSON")
        raise TourServiceError("Failed to parse model response") from exc


def _generate_completion(prompt: str, *, temperature: float, max_tokens: int) -> str:
    try:
        completion = _get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except Exception as exc:
        logger.exception("Groq request failed")
        raise TourServiceError("Error generating response from language model") from exc

    content = completion.choices[0].message.content
    if not content:
        raise TourServiceError("Language model returned an empty response")
    return content.strip()


def build_tour_prompt(request: TourRequest) -> str:
    return f"""You are an expert tour guide. A traveler is planning a trip from {request.from_location} to {request.to_location} and is interested in {request.interests}.

Provide detailed travel recommendations including:
1. Must-see attractions and landmarks
2. Local restaurants and cuisine recommendations
3. Outdoor activities and nature spots
4. Cultural sites and museums
5. Best time to visit
6. Travel tips and local customs
7. Budget-friendly and luxury options

Make recommendations specific, helpful, and encouraging. Make it readable and write two lines for each type in point-wise format."""


def build_options_prompt(request: TourRequest) -> str:
    return f"""You are an expert tour guide. Generate exactly 20 must-visit places for a trip to {request.to_location} with interest in {request.interests}.

Return the response in this EXACT JSON format:
{{
  "low_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "2-3 hours"
    }}
  ],
  "mid_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "3-4 hours"
    }}
  ],
  "high_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "4-5 hours"
    }}
  ]
}}

Distribute places: 5-6 Low priority, 6-7 Mid priority, 6-7 High priority. Return ONLY the JSON object, no extra text."""


def build_itinerary_prompt(request: ItineraryRequest) -> str:
    places_str = ", ".join(request.selected_places)
    return f"""You are an expert travel planner. Create a detailed {request.num_days}-day itinerary for a trip from {request.from_location} to {request.to_location}.

Selected places to visit: {places_str}

Return the response in this EXACT JSON format:
{{
  "itinerary": [
    {{
      "day": 1,
      "places": ["Place 1", "Place 2"],
      "transport_details": ["Auto/Taxi from Place1 to Place2 (15 min)"],
      "timing": ["9:00 AM - 11:00 AM at Place1", "11:30 AM - 1:30 PM at Place2"],
      "notes": "Start early, have breakfast before heading out"
    }},
    {{
      "day": 2,
      "places": ["Place 3"],
      "transport_details": ["Bus from hotel to Place3 (30 min)"],
      "timing": ["10:00 AM - 3:00 PM at Place3"],
      "notes": "Plan lunch at a local restaurant near Place3"
    }}
  ]
}}

Ensure:
- Distribute selected places evenly across {request.num_days} days
- Include realistic transport modes (Auto, Bus, Taxi, Walking, Train)
- Add estimated travel times between places
- Include timing for each activity
- Add helpful notes for each day
- Consider opening hours and travel distances

Return ONLY the JSON object, no extra text."""


def create_tour(request: TourRequest) -> dict:
    from_location = _normalize_location(request.from_location, "From location")
    to_location = _normalize_location(request.to_location, "To location")
    _ensure_distinct_locations(from_location, to_location)

    normalized_request = TourRequest(
        from_location=from_location,
        to_location=to_location,
        interests=request.interests.strip() or "general sightseeing",
    )
    suggestions = _generate_completion(
        build_tour_prompt(normalized_request),
        temperature=0.8,
        max_tokens=2048,
    )

    return {
        "from_location": normalized_request.from_location,
        "to_location": normalized_request.to_location,
        "interests": normalized_request.interests,
        "suggestions": suggestions,
        "created_at": _now_utc(),
    }


def create_tour_options(request: TourRequest) -> dict:
    from_location = _normalize_location(request.from_location, "From location")
    to_location = _normalize_location(request.to_location, "To location")
    _ensure_distinct_locations(from_location, to_location)

    normalized_request = TourRequest(
        from_location=from_location,
        to_location=to_location,
        interests=request.interests.strip() or "general sightseeing",
    )
    response_text = _generate_completion(
        build_options_prompt(normalized_request),
        temperature=0.7,
        max_tokens=3000,
    )
    options_data = _extract_json_object(response_text)

    return {
        "from_location": normalized_request.from_location,
        "to_location": normalized_request.to_location,
        "low_priority": options_data.get("low_priority", []),
        "mid_priority": options_data.get("mid_priority", []),
        "high_priority": options_data.get("high_priority", []),
        "created_at": _now_utc(),
    }


def create_itinerary(request: ItineraryRequest) -> dict:
    from_location = _normalize_location(request.from_location, "From location")
    to_location = _normalize_location(request.to_location, "To location")
    _ensure_distinct_locations(from_location, to_location)

    normalized_request = ItineraryRequest(
        from_location=from_location,
        to_location=to_location,
        num_days=request.num_days,
        selected_places=[
            place.strip() for place in request.selected_places if place.strip()
        ],
    )
    if not normalized_request.selected_places:
        raise ValueError("At least one place must be selected")

    response_text = _generate_completion(
        build_itinerary_prompt(normalized_request),
        temperature=0.7,
        max_tokens=4000,
    )
    itinerary_data = _extract_json_object(response_text)

    return {
        "from_location": normalized_request.from_location,
        "to_location": normalized_request.to_location,
        "num_days": normalized_request.num_days,
        "day_plans": itinerary_data.get("itinerary", []),
        "created_at": _now_utc(),
    }
