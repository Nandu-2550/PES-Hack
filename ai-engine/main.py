from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import diagnose

app = FastAPI(title="AgriShield AI Engine")

# Allow CORS for frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diagnose.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "AgriShield AI Engine"}
