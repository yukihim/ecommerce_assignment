# Agentic Chatbot Project Setup Guide

This document provides instructions for setting up and running the Agentic Chatbot project on your local machine.

## Prerequisites
- Python 3.11 installed on your system

## Installation Steps

1. **Navigate to Project Directory**
   Open your terminal and change to the project directory:
   ```
   cd agentic-chatbot
   ```

2. **Create Virtual Environment**
   Create a Python 3.11 virtual environment to isolate project dependencies:
   ```
   python -m venv .venv
   ```
   Note: Ensure Python 3.11 is installed and accessible via the `python` command.

3. **Activate Virtual Environment**
   Activate the virtual environment to use it:
   - On Windows:
     ```
     .venv/Scripts/Activate
     ```
   After activation, your terminal prompt should display `(.venv)`.

4. **Install Dependencies**
   Install the required packages listed in `requirements.txt`:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. **Start the Chatbot**
   Launch the main application:
   ```
   python main.py
   ```

2. **Test the Chatbot**
   To verify the streaming functionality:
   - Open a new terminal window
   - Run the test script:
     ```
     python test_streaming.py
     ```

## API Endpoint
The chatbot API will be available as a streaming response at:
```
http://127.0.0.1:8000/chat/agents
```

## Troubleshooting
- Ensure Python 3.11 is correctly installed and set as the default `python` command
- Verify the virtual environment is activated before running commands
- Check that all dependencies install successfully

# FYI
This chatbot only implement simple document retrieval without interacting with real database, focus more on the technical part of how swarm of agents work!!