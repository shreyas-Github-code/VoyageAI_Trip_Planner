from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.tours import router as tours_router
from app.core.config import settings
from app.db.session import init_db


def create_app() -> FastAPI:
    init_db()

    application = FastAPI(title=settings.app_name)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(tours_router)
    return application


app = create_app()
