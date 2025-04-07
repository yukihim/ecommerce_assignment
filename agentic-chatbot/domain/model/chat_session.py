from typing import Optional
from pydantic import BaseModel

class ChatSession(BaseModel):
    """Model for chat session input."""
    session_id: Optional[str] = None
    query: str
