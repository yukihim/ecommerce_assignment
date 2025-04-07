import asyncio
import json
import re
import random
from typing import List, Dict, Any, AsyncGenerator, Optional, Tuple, Callable
from dataclasses import dataclass, field


from haystack import Document
from haystack.dataclasses import ChatMessage, ChatRole
from haystack.utils import Secret
from haystack_integrations.components.generators.google_ai import GoogleAIGeminiChatGenerator
from haystack.components.tools import ToolInvoker
from haystack.tools import create_tool_from_function

from app.core.config import (
    DEBUG, RETRIEVED_DOCUMENTS_QUANTITY, HISTORY_LENGTH
)

# Constants for handoff patterns
HANDOFF_TEMPLATE = "Transferred to: {agent_name}. Adopt persona immediately."
HANDOFF_PATTERN = r"Transferred to: (.*?)(?:\.|$)"

@dataclass
class SwarmAgent:
    """Base agent class that can process messages and transfer to other agents"""
    name: str = "SwarmAgent"
    llm: Optional[object] = None    # Will initialize in __post_init__
    instructions: str = "You are a helpful Agent"
    functions: List[Callable] = field(default_factory=list)

    def __post_init__(self):
        # Initialize LLM if not provided
        if self.llm is None:
            self.llm = GoogleAIGeminiChatGenerator(api_key=Secret.from_token("AIzaSyC5bXfXbB5RRUr3RfKC-tGTALhT-7k0grY"), model="gemini-2.0-flash")
        
        self._system_message = ChatMessage.from_system(self.instructions)
        self.tools = [create_tool_from_function(fun) for fun in self.functions] if self.functions else None
        self._tool_invoker = ToolInvoker(tools=self.tools, raise_on_failure=False) if self.tools else None
    
    def run(self, messages: List[ChatMessage]) -> Tuple[str, List[ChatMessage]]:
        """
        Process messages and decide whether to transfer to another agent
        
        Returns:
            Tuple[str, List[ChatMessage]]: (next_agent_name, new_messages)
        """
        # Generate the agent's initial message based on the input messages
        agent_message = self.llm.run(messages=[self._system_message] + messages, tools=self.tools)["replies"][0]
        new_messages = [agent_message]

        # Handle tool calls if present
        if agent_message.tool_calls:
            # Add ID if missing (needed for some models)
            for tc in agent_message.tool_calls:
                if tc.id is None:
                    tc.id = str(random.randint(0, 1000000))
                
            tool_results = self._tool_invoker.run(messages=[agent_message])["tool_messages"]
            new_messages.extend(tool_results)
            
            print(f"Tool results: {tool_results}")

            # Check tool results for transfer
            last_tool_result = tool_results[-1].tool_call_result.result if tool_results else ""
            match = re.search(HANDOFF_PATTERN, last_tool_result)
            if match:
                new_agent_name = match.group(1)
                print("\n\nTRANSFER TO ANOTHER AGENT\n\n")
                print(f"New agent name: {new_agent_name}")
                return new_agent_name, new_messages

            # If no transfer detected, check for other tools like retrieve_documents
            for tool_call in agent_message.tool_calls:
                tool_name = tool_call.tool_name if hasattr(tool_call, 'tool_name') else None
                if tool_name == "retrieve_documents":
                    print("\n\nRETRIEVE DOCUMENTS\n\n")
                    updated_messages = messages + new_messages
                    response_message = self.llm.run(messages=[self._system_message] + updated_messages, tools=self.tools)["replies"][0]
                    new_messages.append(response_message)
                    return self.name, new_messages

        # No tool calls or no transfer, return current agent name
        return self.name, new_messages

# Tool functions for agent transfers
def transfer_to_triage_agent(string: str = ""):
    """Transfer back to Triage Agent for reclassification"""
    return HANDOFF_TEMPLATE.format(agent_name="Triage Agent")

def transfer_to_consulting_agent(string: str = ""):
    """Transfer to Consulting Agent for bot service questions"""
    return HANDOFF_TEMPLATE.format(agent_name="Consulting Agent")

def transfer_to_joker_agent(string: str = ""):
    """Transfer to Joker Agent for jokes"""
    return HANDOFF_TEMPLATE.format(agent_name="Joker Agent")

# More technical agent functions can be added here as needed
def retrieve_bot_service_information_documents(query: str, num_docs: int = RETRIEVED_DOCUMENTS_QUANTITY) -> List[Document]:
    """Sử dụng truy vấn để lấy tài liệu từ kho tài liệu với nhúng vector."""
    print(f"Đang lấy {num_docs} tài liệu cho truy vấn: {query}")
    
    docs=[
        Document(content="""
            Gói Basic (299.000 VNĐ/tháng)
            Dịch vụ chatbot CSM cơ bản với:
            1. Chuyển tiếp đến Hỗ trợ Nhân viên cho các yêu cầu phức tạp.
            2. Cung cấp Thông tin Cơ bản để trả lời các câu hỏi thường gặp của khách hàng.
            3. Độ sẵn sàng cao – Hoạt động lên đến 24/7, với thông báo trong trường hợp máy chủ ngừng hoạt động.
        """),
        Document(content="""
            Gói Premium (499.000 VNĐ/tháng)
            Bao gồm tất cả tính năng của Gói Cơ Bản, cộng thêm:
            1. Thông tin Kho hàng Thời gian thực để cập nhật tình trạng hàng cho khách hàng.
            2. Cá nhân hóa Nâng cao – Chatbot phân tích ý định người dùng và đề xuất sản phẩm, thông tin liên quan để tăng doanh thu.
            3. Tinh chỉnh chatbot để thích ứng cụ thể với danh mục sản phẩm và câu hỏi thường gặp của khách hàng nhằm tùy biến tốt hơn.
        """),
        Document(content="""
            Gói Enterprise (Liên hệ để biết giá)
            Giải pháp chatbot tùy chỉnh hoàn toàn với tất cả tính năng của Gói Nâng Cao, cộng thêm:
            1. Thiết kế Chatbot Riêng biệt phù hợp với nhu cầu cụ thể của từng doanh nghiệp.
            2. Lưu trữ Đám mây để đảm bảo không có thời gian chết.
            3. Hỗ trợ Đa kênh để tích hợp liền mạch trên nhiều nền tảng.
            4. Hỗ trợ Khách hàng Ưu tiên – Hỗ trợ nhanh hơn cho giải pháp chatbot linh hoạt và chuyên biệt.
        """)
    ]
    return docs

# Define the agent system
triage_agent = SwarmAgent(
    name="Triage Agent",
    instructions=(
        "Bạn là một chatbot AI phân loại câu hỏi của người dùng (được phát triển bởi tập đoàn Quantrikinhdoanh)."
        "Nhiệm vụ chính của bạn là phân loại câu hỏi và chuyển đến agent phù hợp:"
        """
        1. Nếu liên quan đến kể chuyện cười, chuyển ngay cho Joker Agent bằng cách gọi transfer_to_joker_agent
        
        2. Nếu liên quan đến bất kỳ thông tin nào về chatbot (giá cả, tính năng, lợi ích, triển khai, so sánh gói dịch vụ), 
           chuyển ngay cho Consulting Agent bằng cách gọi transfer_to_consulting_agent
        
        3. Chỉ xử lý những câu hỏi chào hỏi đơn giản hoặc câu hỏi không rõ ràng. Trong trường hợp này:
           - Trả lời ngắn gọn, lịch sự
           - Giới thiệu bản thân là chatbot tư vấn của Quantrikinhdoanh
           - Mời người dùng hỏi về dịch vụ chatbot
        """
        "Không cung cấp thông tin chi tiết về các gói dịch vụ - để Consulting Agent làm việc đó."
        "Luôn sử dụng tiếng Việt khi giao tiếp với người dùng."
        "Phản hồi ngắn gọn, chỉ 1-2 câu khi xử lý câu hỏi và luôn chủ động chuyển người dùng đến agent phù hợp."
    ),
    functions=[transfer_to_consulting_agent, transfer_to_joker_agent],
)

consulting_agent = SwarmAgent(
    name="Consulting Agent",
    instructions=(
        "Bạn là Chuyên viên tư vấn về dịch vụ chatbot của tập đoàn Quantrikinhdoanh."
        "Nhiệm vụ chính của bạn là tư vấn về các gói dịch vụ chatbot, giá cả, tính năng và lợi ích khi sử dụng chatbot cho doanh nghiệp."
        "Luôn luôn sử dụng retrieve_bot_service_information_documents để lấy thông tin chi tiết về các gói dịch vụ chatbot của Quantrikinhdoanh."
        "Khi được hỏi về dịch vụ, LUÔN liệt kê đầy đủ cả 3 gói dịch vụ (Basic, Premium và Enterprise) kèm giá cả và tính năng."
        "Với ngân sách cao (từ 1.000.000 VNĐ/tháng), đề xuất Enterprise Package vì đây là gói cao cấp nhất với nhiều tính năng độc quyền."
        "Nhấn mạnh những lợi ích của chatbot trong việc nâng cao trải nghiệm khách hàng, giảm chi phí vận hành, và tăng doanh thu."
        "Chủ động đề xuất gói dịch vụ phù hợp với quy mô và nhu cầu của doanh nghiệp khách hàng."
        "Giải thích rõ quy trình triển khai, thời gian và hỗ trợ kỹ thuật sau khi mua dịch vụ."
        "Nếu câu hỏi không liên quan đến dịch vụ chatbot, chuyển cho Triage Agent bằng cách gọi transfer_to_triage_agent."
        "Nếu yêu cầu kể chuyện cười, chuyển cho Joker Agent bằng cách gọi transfer_to_joker_agent."
        "Luôn sử dụng tiếng Việt, giọng điệu chuyên nghiệp, thân thiện và thể hiện sự am hiểu sâu sắc về ngành công nghệ chatbot."
        "Sử dụng định dạng Markdown để trình bày thông tin rõ ràng và hấp dẫn về các gói dịch vụ chatbot."
    ),
    functions=[retrieve_bot_service_information_documents, transfer_to_triage_agent, transfer_to_joker_agent],
)

joker_agent = SwarmAgent(
    name="Joker Agent",
    instructions=(
        "Hãy giả dạng Joker để kể chuyện cười cho người dùng một cách cợt nhả."
        "Nếu người dùng không hỏi kể chuyện cười, hãy gọi transfer_to_triage_agent để chuyển về Triage Agent."
    ),
    functions=[transfer_to_triage_agent, transfer_to_consulting_agent],
)

# Create the agent dictionary for easy access
AGENTS = {
    agent.name: agent for agent in [
        triage_agent, consulting_agent, joker_agent
    ]
}

class SwarmPipeline:
    """Implements a pipeline using a swarm of specialized agents."""
    
    def __init__(self, session_id: str):
        """Initialize the swarm pipeline with a session ID."""
        self.session_id = session_id
        self.history: List[ChatMessage] = []
        self.current_agent_name = "Triage Agent"  # Always start with Triage Agent
    
    async def process_user_input(self, query: str) -> AsyncGenerator[str, None]:
        """Process user input through the swarm of agents system."""
        if DEBUG:
            print("\nRunning agent swarm")
            
        # Add user query to history
        user_message = ChatMessage.from_user(query)
        self.history.append(user_message)
        
        if DEBUG:
            print(f"\nself.history length: {len(self.history)}")
            print(f"Current agent: {self.current_agent_name}")
        
        # Return session_id first
        session_info = f"data: {json.dumps({'session_id': self.session_id})}\n\n"
        yield session_info
        
        # Get the current agent and inform client which agent is answering
        agent = AGENTS[self.current_agent_name]
        agent_info = f"data: {json.dumps({'agent': self.current_agent_name})}\n\n"
        yield agent_info
        
        # Process with the agent
        next_agent_name, new_messages = agent.run(self.history)
        
        # Add agent response to history
        assistant_messages = []
        for msg in new_messages:
            if msg not in self.history:
                self.history.append(msg)
                # Collect assistant messages for streaming
                if msg.role == ChatRole.ASSISTANT and msg.text:
                    assistant_messages.append(msg)
        
        # Stream the assistant's response
        if assistant_messages:
            for msg in assistant_messages:
                content_chunk = f"data: {json.dumps({'content': msg.text})}\n\n"
                yield content_chunk
                # await asyncio.sleep(0.01)  # Small delay to prevent flooding
        
        # If agent changed, notify client and process with new agent
        if next_agent_name != self.current_agent_name:
            if DEBUG:
                print(f"Switching from {self.current_agent_name} to {next_agent_name}")
            
            # Update current agent and inform client
            self.current_agent_name = next_agent_name
            agent_switch = f"data: {json.dumps({'agent_switch': next_agent_name})}\n\n"
            yield agent_switch
            
            # Process with new agent
            new_agent = AGENTS[next_agent_name]
            _, additional_messages = new_agent.run(self.history)
            
            # Add new agent's messages to history and stream them
            assistant_messages = []
            for msg in additional_messages:
                if msg not in self.history:
                    self.history.append(msg)
                    if msg.role == ChatRole.ASSISTANT and msg.text:
                        assistant_messages.append(msg)
            
            # Stream the new agent's response
            if assistant_messages:
                for msg in assistant_messages:
                    content_chunk = f"data: {json.dumps({'content': msg.text})}\n\n"
                    yield content_chunk
                    # await asyncio.sleep(0.01)  # Small delay to prevent flooding
        
        # Ensure we don't keep too many messages in history
        if len(self.history) > HISTORY_LENGTH:
            self.history = self.history[-HISTORY_LENGTH:]
            
        # Signal completion
        yield f"data: {json.dumps({'done': True})}\n\n"