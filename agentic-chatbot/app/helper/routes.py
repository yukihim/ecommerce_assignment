from fastapi import APIRouter
from domain.usecase import send_chat_uce

router = APIRouter()

# Router Chat
# The prefix "/chat" + the empty path "" in send_chat_uce.py => final ws://<host>:<port>/chat
router.include_router(send_chat_uce.router, prefix="/chat", tags=["Chat"])
