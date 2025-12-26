import os
import traceback
import logging
from dotenv import load_dotenv
from google.adk.agents.llm_agent import Agent
from google.adk.tools.agent_tool import AgentTool
from .sub_agents.performance_management_graphql_tool.agent import performance_management_graphql_tool

# Load environment variables
load_dotenv()

# --- Configuration Helpers ---

def load_instructions(filename: str = "agent-instructions.txt") -> str:
    """Loads agent instructions from a file."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, filename)
        with open(file_path, "r") as f:
            return f.read().strip()
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Warning: Could not load instructions from {filename}, using default. Error: {e}", exc_info=True)
        return """You are the Performance Management Assistant. 
        Your goal is to help users manage their goals, users, and departments.
        """

# --- Configuration Values ---

AGENT_NAME = os.getenv("AGENT_NAME", "pulse_performance_agent")
AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-3-pro-preview")
AGENT_DESCRIPTION = os.getenv("AGENT_DESCRIPTION", "An agent that helps manage performance management system: goals, users, and departments.")
AGENT_INSTRUCTION_FILE = os.getenv("AGENT_INSTRUCTION_FILE", "agent-instructions.txt")

# --- Agent Initialization ---
print(f"Initializing agent with model: {AGENT_MODEL}")
agent_instruction = load_instructions(AGENT_INSTRUCTION_FILE)
print(f"Agent instruction loaded from {AGENT_INSTRUCTION_FILE}")

root_agent = Agent(
    name=AGENT_NAME,
    model=AGENT_MODEL,
    description=AGENT_DESCRIPTION,
    instruction=agent_instruction,
    tools=[AgentTool(performance_management_graphql_tool)]
)


