from fastapi import APIRouter, HTTPException, status
from app.schemas.tour import (
    ItineraryRequest,
    ItineraryResponse,
    TourOptionsResponse,
    TourRequest,
    TourResponse,
)
from app.services.tour_service import (
    TourServiceError,
    create_itinerary,
    create_tour,
    create_tour_options,
)

router = APIRouter(tags=["tours"])


def _handle_service_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ValueError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(exc),
    )


@router.post("/tour", response_model=TourResponse)
def tour_guide(request: TourRequest) -> TourResponse:
    try:
        return create_tour(request)
    except (ValueError, TourServiceError) as exc:
        raise _handle_service_error(exc) from exc


@router.post("/tour/options", response_model=TourOptionsResponse)
def generate_tour_options(
    request: TourRequest,
) -> TourOptionsResponse:
    try:
        return create_tour_options(request)
    except (ValueError, TourServiceError) as exc:
        raise _handle_service_error(exc) from exc


@router.post("/tour/itinerary", response_model=ItineraryResponse)
def create_tour_itinerary(
    request: ItineraryRequest,
) -> ItineraryResponse:
    try:
        return create_itinerary(request)
    except (ValueError, TourServiceError) as exc:
        raise _handle_service_error(exc) from exc
