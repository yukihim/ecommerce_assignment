import json
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
from domain.model.chat_session import ChatSession
from data.datasource.swarm_of_agents_dts import SwarmPipeline

router = APIRouter()

swarm_pipelines: Dict[str, SwarmPipeline] = {}

@router.post(
    "/agents",
    summary="Agent Swarm Chat Pipeline",
    responses={
        200: {
            "description": "Streaming agent swarm response",
            "content": {
                "text/event-stream": {
                    "example": "data: {\"content\": \"This is a response from an agent\", \"agent\": \"Business Agent\"}\n\n",
                }
            },
        },
        400: {
            "description": "Bad Request - The query is empty",
            "content": {"application/json": {"example": {"detail": "Query cannot be empty"}}},
        },
        500: {
            "description": "Internal Server Error",
            "content": {"application/json": {"example": {"detail": "Error processing user input"}}},
        },
    },
)
async def agent_chat_endpoint(payload: ChatSession):
    """
    Stream chat responses using a session-specific SwarmPipeline with specialized agents.

    **Request Body:**
    - `session_id` (optional, string): If not provided, a new session ID is generated.
    - `query` (required, string): The user's chat input.

    **Response:**
    - **200 OK**: Streaming response (`text/event-stream`) including agent information.
    - **400 Bad Request**: If `query` is empty.
    - **500 Internal Server Error**: If something goes wrong.
    """

    # Validate input
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Generate a new session_id if not provided
    if not payload.session_id:
        payload.session_id = str(uuid.uuid4())

    # Initialize swarm pipeline if not exists
    try:
        if payload.session_id not in swarm_pipelines:
            swarm_pipelines[payload.session_id] = SwarmPipeline(payload.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize swarm pipeline: {str(e)}")

    swarm_pipeline = swarm_pipelines[payload.session_id]

    try:
        response_generator = swarm_pipeline.process_user_input(payload.query)
        
        headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
        
        return StreamingResponse(response_generator, media_type="text/event-stream", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing user input: {str(e)}")