import json
import requests

BASE_URL = "http://127.0.0.1:8000/chat/agents"  # LOCAL

def agent_chat_stream():
    """Chat streaming CLI with agent swarm that continues until user exits or interrupts."""
    session_id = None  # will be set after the first call
    current_agent = None  # track the current agent
    print("Agent Swarm Chat CLI - Type your questions (or 'exit', 'quit', 'thoát' to quit)")
    
    while True:
        try:
            user_input = input("\n> ")
        except KeyboardInterrupt:
            print("\n\nExiting chat...")
            break

        if user_input.lower() in ['exit', 'quit', 'thoát']:
            print("Goodbye!")
            break

        payload = {
            "query": user_input
        }
        
        # Include session_id if we already have one
        if session_id is not None:
            payload["session_id"] = session_id

        headers = {"Content-Type": "application/json"}
        try:
            # Clear previous output
            print("\nAssistant:", end="", flush=True)
            
            response = requests.post(BASE_URL, json=payload, headers=headers, stream=True, timeout=120)
            if response.status_code != 200:
                print(f"\nError: Received status code {response.status_code}")
                print("Response:", response.text)
                continue

            output_text = ""
            agent_displayed = False  # Flag to track if we've displayed the agent name
            
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith("data: "):
                    token_str = line.replace("data: ", "")
                    try:
                        token_obj = json.loads(token_str)
                    except json.JSONDecodeError:
                        token_obj = {"content": token_str}
                    
                    # Handle session_id
                    if "session_id" in token_obj and not session_id:
                        session_id = token_obj["session_id"]
                    
                    # Handle agent identification
                    if "agent" in token_obj:
                        current_agent = token_obj["agent"]
                        if not agent_displayed:
                            print(f" [{current_agent}] ", end="", flush=True)
                            agent_displayed = True
                    
                    # Handle agent switch
                    if "agent_switch" in token_obj:
                        new_agent = token_obj["agent_switch"]
                        print(f"\n\n[Switching to {new_agent}] ", end="", flush=True)
                        current_agent = new_agent
                        output_text = ""  # Reset output for the new agent
                        agent_displayed = True  # We've displayed the new agent name
                    
                    # Print content
                    if "content" in token_obj:
                        content = token_obj["content"]
                        # Ensure we've displayed the agent name before content
                        if not agent_displayed and current_agent:
                            print(f" [{current_agent}] ", end="", flush=True)
                            agent_displayed = True
                        print(content, end="", flush=True)
                        output_text += content
            
            print()  # Final newline
            
        except requests.RequestException as e:
            print(f"\nConnection error: {e}")
            print("Make sure your API server is running at", BASE_URL)

if __name__ == "__main__":
    agent_chat_stream()