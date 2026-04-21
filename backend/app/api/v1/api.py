from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic_plans,
    auth,
    categories,
    classifications,
    levels,
    notifications,
    papers,
    projects,
    statistics,
    uploads,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(classifications.router)
api_router.include_router(levels.router)
api_router.include_router(projects.router)
api_router.include_router(papers.router)
api_router.include_router(academic_plans.router)
api_router.include_router(notifications.router)
api_router.include_router(statistics.router)
api_router.include_router(uploads.router)
