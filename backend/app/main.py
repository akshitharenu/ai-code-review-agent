

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from app.models import Base
from app.routes.review import router as review_router

app = FastAPI(title="AI Code Review Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(review_router)

@app.get("/")
def root():
    return {"message": "AI Code Review Agent is running 🚀"}