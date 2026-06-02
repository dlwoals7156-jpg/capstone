from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.session import init_database
from backend.routes import ai, analysis, auth, recommendations, users


# FastAPI entry point. Run with:
# uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
app = FastAPI(title="Deeplook API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep the local SQLite schema ready in both uvicorn and lightweight tests.
init_database()


@app.on_event("startup")
def startup() -> None:
    init_database()


@app.get("/")
def read_root():
    return {"status": "online", "message": "Deeplook FastAPI backend is running."}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(analysis.router)
app.include_router(recommendations.router)
app.include_router(ai.router)
