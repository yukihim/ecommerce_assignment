import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.helper.routes import router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Haystack + Elasticsearch + FastAPI",
        description="API Chat for Response Streaming using WebSockets",
        version="1.1.0",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["POST"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )
    
    app.include_router(router)
    return app

app = create_app()

if __name__ == "__main__":
    # https://github.com/encode/uvicorn/issues/1609
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws_ping_timeout=3600)
