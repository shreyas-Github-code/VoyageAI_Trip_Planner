from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tour import (
    ItineraryDetailResponse,
    ItineraryRequest,
    ItineraryResponse,
    TourOptionsDetailResponse,
    TourOptionsResponse,
    TourRequest,
    TourResponse,
)
from app.services.tour_service import (
    TourNotFoundError,
    TourServiceError,
    create_itinerary,
    create_tour,
    create_tour_options,
    get_itinerary_by_id,
    get_tour_by_id,
    get_tour_history,
    get_tour_options_by_id,
)

router = APIRouter(tags=["tours"])


def _handle_service_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ValueError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if isinstance(exc, TourNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(exc),
    )


@router.post("/tour", response_model=TourResponse)
def tour_guide(request: TourRequest, db: Session = Depends(get_db)) -> TourResponse:
    try:
        return create_tour(db, request)
    except (ValueError, TourServiceError) as exc:
        db.rollback()
        raise _handle_service_error(exc) from exc


@router.post("/tour/options", response_model=TourOptionsResponse)
def generate_tour_options(
    request: TourRequest,
    db: Session = Depends(get_db),
) -> TourOptionsResponse:
    try:
        return create_tour_options(db, request)
    except (ValueError, TourServiceError) as exc:
        db.rollback()
        raise _handle_service_error(exc) from exc


@router.post("/tour/itinerary", response_model=ItineraryResponse)
def create_tour_itinerary(
    request: ItineraryRequest,
    db: Session = Depends(get_db),
) -> ItineraryResponse:
    try:
        return create_itinerary(db, request)
    except (ValueError, TourServiceError) as exc:
        db.rollback()
        raise _handle_service_error(exc) from exc


@router.get("/tour-history", response_model=list[TourResponse])
def tour_history(db: Session = Depends(get_db)) -> list[TourResponse]:
    return get_tour_history(db)


@router.get("/tour/{tour_id}", response_model=TourResponse)
def get_tour(tour_id: int, db: Session = Depends(get_db)) -> TourResponse:
    try:
        return get_tour_by_id(db, tour_id)
    except TourNotFoundError as exc:
        raise _handle_service_error(exc) from exc


@router.get("/tour/options/{option_id}", response_model=TourOptionsDetailResponse)
def get_tour_options(
    option_id: int,
    db: Session = Depends(get_db),
) -> TourOptionsDetailResponse:
    try:
        return get_tour_options_by_id(db, option_id)
    except TourNotFoundError as exc:
        raise _handle_service_error(exc) from exc


@router.get(
    "/tour/itinerary/{itinerary_id}",
    response_model=ItineraryDetailResponse,
)
def get_tour_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
) -> ItineraryDetailResponse:
    try:
        return get_itinerary_by_id(db, itinerary_id)
    except TourNotFoundError as exc:
        raise _handle_service_error(exc) from exc
