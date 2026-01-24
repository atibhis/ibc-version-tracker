from fastapi import APIRouter
from app.api.v1.endpoints import laws, hierarchy, content, search

api_router = APIRouter()

# We will include actual routers as we implement them
api_router.include_router(laws.router, prefix="/laws", tags=["laws"])
api_router.include_router(hierarchy.router, prefix="/hierarchy", tags=["hierarchy"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
