from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os

from app.core.config import settings
from app.db.base import Base, engine
from app.api import auth, users, posts, connections, notifications, companies, jobs, messages, courses, admin

Base.metadata.create_all(bind=engine)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
for sub in ["avatars", "banners", "documents", "resumes"]:
    os.makedirs(os.path.join(settings.UPLOAD_DIR, sub), exist_ok=True)

app = FastAPI(title="LinkedIn API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(connections.router)
app.include_router(notifications.router)
app.include_router(companies.router)
app.include_router(jobs.router)
app.include_router(messages.router)
app.include_router(courses.router)
app.include_router(admin.router)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"status": "ok", "service": "LinkedIn API"}
