import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, ingredients, recipes, suggestions


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="2%", lifespan=lifespan)

# Only needed in dev when the Vite server talks straight to :8000;
# in production the frontend is served same-origin from this app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ingredients.router)
app.include_router(suggestions.router)
app.include_router(recipes.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# In production, serve the built frontend (API routes above take precedence).
if settings.static_dir and os.path.isdir(settings.static_dir):
    app.mount("/", StaticFiles(directory=settings.static_dir, html=True), name="static")
