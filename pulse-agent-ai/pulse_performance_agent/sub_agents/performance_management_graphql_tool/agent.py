import os
from dotenv import load_dotenv
from google.adk.agents.llm_agent import Agent
from .utils import tools as tools_module
from .graphql_agent_instructions import GraphQLAgentInstructions

# Load environment variables
load_dotenv()

# --- Tools Definition ---

tools_list = [
    # User tools
    tools_module.get_user,
    tools_module.get_user_by_email,
    tools_module.list_users,
    tools_module.get_team_members,
    tools_module.create_user,
    tools_module.update_user,
    tools_module.delete_user,
    tools_module.set_user_manager,
    
    # Goal tools
    tools_module.get_goal,
    tools_module.list_goals,
    tools_module.get_goals_by_owner,
    tools_module.get_all_goals_for_hr,
    tools_module.get_goals_pending_approval,
    tools_module.get_department_members_goals,
    tools_module.get_goal_notes,
    tools_module.create_goal,
    tools_module.update_goal,
    tools_module.assign_goal_to_user,
    tools_module.unassign_goal_from_user,
    tools_module.lock_goal,
    tools_module.unlock_goal,
    tools_module.delete_goal,
    tools_module.update_target_completion_date,
    tools_module.approve_goal,
    
    # KPI tools
    tools_module.create_kpi,
    tools_module.update_kpi,
    tools_module.delete_kpi,
    
    # Department tools
    tools_module.get_department,
    tools_module.list_departments,
    tools_module.get_root_departments,
    tools_module.get_departments_managed_by_me,
    tools_module.create_department,
    tools_module.update_department,
    tools_module.assign_user_to_department,
    tools_module.delete_department,
    tools_module.set_department_manager,
    tools_module.assign_manager_assistant,
    tools_module.move_user_to_department,
    
    # Team tools
    tools_module.get_team,
    tools_module.list_teams,
    tools_module.get_teams_by_department,
    tools_module.create_team,
    tools_module.update_team,
    tools_module.delete_team,
    tools_module.assign_user_to_team,
    tools_module.remove_user_from_team,
    
    # Tenant tools
    tools_module.list_tenants,
    
    # Territory tools
    tools_module.list_territories,
    tools_module.get_territory,
    tools_module.create_territory,
    tools_module.update_territory,
    tools_module.delete_territory,
    
    # Goal Note tools
    tools_module.create_goal_note,
    tools_module.update_goal_note,
    tools_module.delete_goal_note,
    
    # Bulk operations
    tools_module.bulk_upload_users,
]

# --- Agent Initialization ---
AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-3-pro-preview")
print(f"Initializing GraphQL agent with model: {AGENT_MODEL}")
performance_management_graphql_tool = Agent(
    name="performance_management_graphql_tool",
    model=AGENT_MODEL,
    description=GraphQLAgentInstructions.get_description(),
    instruction=GraphQLAgentInstructions.get_instructions(),
    tools=tools_list
)


