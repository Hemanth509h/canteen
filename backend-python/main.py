import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from routes import router
from db import connect_to_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi")

def format_log(message, source="fastapi"):
    formatted_time = datetime.now().strftime("%I:%M:%S %p")
    return f"{formatted_time} [{source}] {message}"

app = FastAPI()

# Enable CORS with specific origin for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    
    # Debug log for incoming request
    logger.info(format_log(f"Request: {request.method} {path}"))
    
    response = await call_next(request)
    
    # Add CORS headers manually if needed to be absolutely sure
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    process_time = (time.time() - start_time) * 1000
    if path.startswith("/api"):
        log_line = f"{request.method} {path} {response.status_code} in {process_time:.2f}ms"
        logger.info(format_log(log_line))
        
    return response

# Include routes
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    try:
        await connect_to_database()
        logger.info(format_log("API server started and database connected"))
    except Exception as e:
        logger.error(format_log(f"Failed to start server: {e}"))
        raise e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
