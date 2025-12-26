from .graphql_client import GraphQLClient
from . import queries
from typing import Optional, List
import json


def ensure_date(date_str: Optional[str]) -> Optional[str]:
    """Ensures the date string is in Date format (YYYY-MM-DD).
    For Date scalar fields like creationDate, completionDate, etc.
    """
    if not date_str:
        return None
    # If already in YYYY-MM-DD format, return as is
    if len(date_str) == 10 and date_str.count("-") == 2:
        return date_str
    # If it's a DateTime string, extract just the date part
    if "T" in date_str:
        return date_str.split("T")[0]
    return date_str


# Initialize client (token will be passed per-call)
client = GraphQLClient()


# ===== USER TOOLS =====

def get_user(user_id: str, token: Optional[str] = None) -> str:
    """Get a user by ID.
    
    Args:
        user_id: The ID of the user
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": user_id}
        result = client.execute(queries.GET_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching user: {str(e)}"


def get_user_by_email(email: str, token: Optional[str] = None) -> str:
    """Get a user by email address.
    
    Args:
        email: The email address of the user
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"email": email}
        result = client.execute(queries.GET_USER_BY_EMAIL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching user by email: {str(e)}"


def list_users(token: Optional[str] = None) -> str:
    """List all users.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_USERS, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error listing users: {str(e)}"


def get_team_members(manager_id: str, token: Optional[str] = None) -> str:
    """Get team members for a manager.
    
    Args:
        manager_id: The ID of the manager
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"managerId": manager_id}
        result = client.execute(queries.GET_TEAM_MEMBERS, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching team members: {str(e)}"


def create_user(first_name: str, last_name: str, email: str, title: Optional[str] = None, 
                manager_id: Optional[str] = None, department_id: Optional[str] = None,
                token: Optional[str] = None) -> str:
    """Create a new user.
    
    Args:
        first_name: First name of the user
        last_name: Last name of the user
        email: Email address (unique identifier)
        title: Optional job title
        manager_id: Optional manager ID
        department_id: Optional department ID
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "title": title,
            "managerId": manager_id,
            "departmentId": department_id
        }
        variables = {"input": input_data}
        result = client.execute(queries.CREATE_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error creating user: {str(e)}"


def update_user(user_id: str, first_name: Optional[str] = None, last_name: Optional[str] = None,
                email: Optional[str] = None, title: Optional[str] = None,
                manager_id: Optional[str] = None, department_id: Optional[str] = None,
                token: Optional[str] = None) -> str:
    """Update an existing user.
    
    Args:
        user_id: ID of the user to update
        first_name: New first name
        last_name: New last name
        email: New email
        title: New title
        manager_id: New manager ID
        department_id: New department ID
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {}
        if first_name is not None:
            input_data["firstName"] = first_name
        if last_name is not None:
            input_data["lastName"] = last_name
        if email is not None:
            input_data["email"] = email
        if title is not None:
            input_data["title"] = title
        if manager_id is not None:
            input_data["managerId"] = manager_id
        if department_id is not None:
            input_data["departmentId"] = department_id
        
        variables = {"id": user_id, "input": input_data}
        result = client.execute(queries.UPDATE_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating user: {str(e)}"


def delete_user(user_id: str, token: Optional[str] = None) -> str:
    """Delete a user.
    
    Args:
        user_id: ID of the user to delete
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": user_id}
        result = client.execute(queries.DELETE_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error deleting user: {str(e)}"


def set_user_manager(user_id: str, manager_id: Optional[str] = None, token: Optional[str] = None) -> str:
    """Set or unset a user's manager.
    
    Args:
        user_id: ID of the user
        manager_id: ID of the manager (None to unset)
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"userId": user_id, "managerId": manager_id}
        result = client.execute(queries.SET_USER_MANAGER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error setting user manager: {str(e)}"


# ===== GOAL TOOLS =====

def get_goal(goal_id: str, token: Optional[str] = None) -> str:
    """Get a goal by ID.
    
    Args:
        goal_id: The ID of the goal
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": goal_id}
        result = client.execute(queries.GET_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching goal: {str(e)}"


def list_goals(token: Optional[str] = None) -> str:
    """List all goals.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_GOALS, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error listing goals: {str(e)}"


def get_goals_by_owner(owner_email: str, token: Optional[str] = None) -> str:
    """Get goals by owner email.
    
    Args:
        owner_email: Email of the goal owner
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"email": owner_email}
        result = client.execute(queries.GET_GOALS_BY_OWNER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching goals by owner: {str(e)}"


def get_all_goals_for_hr(token: Optional[str] = None) -> str:
    """Get all goals for HR view.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_ALL_GOALS_FOR_HR, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching all goals for HR: {str(e)}"


def get_goals_pending_approval(department_id: str, token: Optional[str] = None) -> str:
    """Get goals pending approval for a department.
    
    Args:
        department_id: ID of the department
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"departmentId": department_id}
        result = client.execute(queries.GET_GOALS_PENDING_APPROVAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching goals pending approval: {str(e)}"


def get_department_members_goals(department_id: str, token: Optional[str] = None) -> str:
    """Get goals for all members of a department.
    
    Args:
        department_id: ID of the department
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"departmentId": department_id}
        result = client.execute(queries.GET_DEPARTMENT_MEMBERS_GOALS, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching department members goals: {str(e)}"


def get_goal_notes(goal_id: str, token: Optional[str] = None) -> str:
    """Get notes for a goal.
    
    Args:
        goal_id: ID of the goal
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"goalId": goal_id}
        result = client.execute(queries.GET_GOAL_NOTES, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching goal notes: {str(e)}"


def create_goal(short_description: str, long_description: str, owner_email: str,
                creation_date: Optional[str] = None, completion_date: Optional[str] = None,
                assigned_date: Optional[str] = None, target_completion_date: Optional[str] = None,
                status: Optional[str] = None, parent_goal_id: Optional[str] = None,
                confidential: Optional[bool] = None, kpis: Optional[List[dict]] = None,
                token: Optional[str] = None) -> str:
    """Create a new goal.
    
    Args:
        short_description: Short description of the goal
        long_description: Long description of the goal
        owner_email: Email of the goal owner
        creation_date: Creation date (YYYY-MM-DD)
        completion_date: Completion date (YYYY-MM-DD)
        assigned_date: Assigned date (YYYY-MM-DD)
        target_completion_date: Target completion date (YYYY-MM-DD)
        status: Goal status (DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, ACHIEVED, ARCHIVED, RETIRED)
        parent_goal_id: ID of parent goal (for nested goals)
        confidential: Whether goal is confidential
        kpis: List of KPI input dictionaries
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {
            "shortDescription": short_description,
            "longDescription": long_description,
            "ownerEmail": owner_email,
            "creationDate": ensure_date(creation_date),
            "completionDate": ensure_date(completion_date),
            "assignedDate": ensure_date(assigned_date),
            "targetCompletionDate": ensure_date(target_completion_date),
            "status": status,
            "parentGoalId": parent_goal_id,
            "confidential": confidential,
            "kpis": kpis
        }
        variables = {"input": input_data}
        result = client.execute(queries.CREATE_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error creating goal: {str(e)}"


def update_goal(goal_id: str, short_description: Optional[str] = None,
                long_description: Optional[str] = None, owner_email: Optional[str] = None,
                creation_date: Optional[str] = None, completion_date: Optional[str] = None,
                assigned_date: Optional[str] = None, target_completion_date: Optional[str] = None,
                status: Optional[str] = None, parent_goal_id: Optional[str] = None,
                confidential: Optional[bool] = None, kpis: Optional[List[dict]] = None,
                token: Optional[str] = None) -> str:
    """Update an existing goal.
    
    Args:
        goal_id: ID of the goal to update
        short_description: New short description
        long_description: New long description
        owner_email: New owner email
        creation_date: New creation date (YYYY-MM-DD)
        completion_date: New completion date (YYYY-MM-DD)
        assigned_date: New assigned date (YYYY-MM-DD)
        target_completion_date: New target completion date (YYYY-MM-DD)
        status: New status
        parent_goal_id: New parent goal ID
        confidential: New confidential flag
        kpis: New KPIs list
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {}
        if short_description is not None:
            input_data["shortDescription"] = short_description
        if long_description is not None:
            input_data["longDescription"] = long_description
        if owner_email is not None:
            input_data["ownerEmail"] = owner_email
        if creation_date is not None:
            input_data["creationDate"] = ensure_date(creation_date)
        if completion_date is not None:
            input_data["completionDate"] = ensure_date(completion_date)
        if assigned_date is not None:
            input_data["assignedDate"] = ensure_date(assigned_date)
        if target_completion_date is not None:
            input_data["targetCompletionDate"] = ensure_date(target_completion_date)
        if status is not None:
            input_data["status"] = status
        if parent_goal_id is not None:
            input_data["parentGoalId"] = parent_goal_id
        if confidential is not None:
            input_data["confidential"] = confidential
        if kpis is not None:
            input_data["kpis"] = kpis
        
        variables = {"id": goal_id, "input": input_data}
        result = client.execute(queries.UPDATE_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating goal: {str(e)}"


def assign_goal_to_user(goal_id: str, user_email: str, token: Optional[str] = None) -> str:
    """Assign a goal to a user.
    
    Args:
        goal_id: ID of the goal
        user_email: Email of the user to assign to
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"goalId": goal_id, "userEmail": user_email}
        result = client.execute(queries.ASSIGN_GOAL_TO_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error assigning goal to user: {str(e)}"


def unassign_goal_from_user(goal_id: str, user_email: str, token: Optional[str] = None) -> str:
    """Unassign a goal from a user.
    
    Args:
        goal_id: ID of the goal
        user_email: Email of the user to unassign from
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"goalId": goal_id, "userEmail": user_email}
        result = client.execute(queries.UNASSIGN_GOAL_FROM_USER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error unassigning goal from user: {str(e)}"


def lock_goal(goal_id: str, token: Optional[str] = None) -> str:
    """Lock a goal.
    
    Args:
        goal_id: ID of the goal to lock
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": goal_id}
        result = client.execute(queries.LOCK_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error locking goal: {str(e)}"


def unlock_goal(goal_id: str, token: Optional[str] = None) -> str:
    """Unlock a goal.
    
    Args:
        goal_id: ID of the goal to unlock
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": goal_id}
        result = client.execute(queries.UNLOCK_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error unlocking goal: {str(e)}"


def delete_goal(goal_id: str, token: Optional[str] = None) -> str:
    """Delete a goal.
    
    Args:
        goal_id: ID of the goal to delete
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": goal_id}
        result = client.execute(queries.DELETE_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error deleting goal: {str(e)}"


def update_target_completion_date(goal_id: str, target_completion_date: Optional[str] = None,
                                  token: Optional[str] = None) -> str:
    """Update target completion date for a goal.
    
    Args:
        goal_id: ID of the goal
        target_completion_date: New target completion date (YYYY-MM-DD)
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {
            "goalId": goal_id,
            "targetCompletionDate": ensure_date(target_completion_date)
        }
        result = client.execute(queries.UPDATE_TARGET_COMPLETION_DATE, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating target completion date: {str(e)}"


def approve_goal(goal_id: str, token: Optional[str] = None) -> str:
    """Approve a goal.
    
    Args:
        goal_id: ID of the goal to approve
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"goalId": goal_id}
        result = client.execute(queries.APPROVE_GOAL, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error approving goal: {str(e)}"


# ===== KPI TOOLS =====

def create_kpi(goal_id: str, description: str, due_date: str, status: Optional[str] = None,
               completion_percentage: Optional[int] = None, token: Optional[str] = None) -> str:
    """Create a KPI for a goal.
    
    Args:
        goal_id: ID of the goal
        description: Description of the KPI
        due_date: Due date (YYYY-MM-DD)
        status: KPI status (NOT_STARTED, IN_PROGRESS, ACHIEVED, NOT_ACHIEVED, COMPLETED)
        completion_percentage: Completion percentage (0-100)
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {
            "description": description,
            "dueDate": ensure_date(due_date),
            "status": status,
            "completionPercentage": completion_percentage
        }
        variables = {"goalId": goal_id, "input": input_data}
        result = client.execute(queries.CREATE_KPI, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error creating KPI: {str(e)}"


def update_kpi(kpi_id: str, description: Optional[str] = None, status: Optional[str] = None,
               completion_percentage: Optional[int] = None, due_date: Optional[str] = None,
               token: Optional[str] = None) -> str:
    """Update a KPI.
    
    Args:
        kpi_id: ID of the KPI
        description: New description
        status: New status
        completion_percentage: New completion percentage
        due_date: New due date (YYYY-MM-DD)
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {}
        if description is not None:
            input_data["description"] = description
        if status is not None:
            input_data["status"] = status
        if completion_percentage is not None:
            input_data["completionPercentage"] = completion_percentage
        if due_date is not None:
            input_data["dueDate"] = ensure_date(due_date)
        
        variables = {"id": kpi_id, "input": input_data}
        result = client.execute(queries.UPDATE_KPI, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating KPI: {str(e)}"


def delete_kpi(kpi_id: str, token: Optional[str] = None) -> str:
    """Delete a KPI.
    
    Args:
        kpi_id: ID of the KPI to delete
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": kpi_id}
        result = client.execute(queries.DELETE_KPI, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error deleting KPI: {str(e)}"


# ===== DEPARTMENT TOOLS =====

def get_department(department_id: str, token: Optional[str] = None) -> str:
    """Get a department by ID.
    
    Args:
        department_id: The ID of the department
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": department_id}
        result = client.execute(queries.GET_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching department: {str(e)}"


def list_departments(token: Optional[str] = None) -> str:
    """List all departments.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_DEPARTMENTS, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error listing departments: {str(e)}"


def get_root_departments(token: Optional[str] = None) -> str:
    """Get root departments (no parent).
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_ROOT_DEPARTMENTS, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching root departments: {str(e)}"


def get_departments_managed_by_me(token: Optional[str] = None) -> str:
    """Get departments managed by the current user.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_DEPARTMENTS_MANAGED_BY_ME, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error fetching departments managed by me: {str(e)}"


def create_department(name: str, small_description: str, manager_email: Optional[str] = None,
                     manager_assistant_email: Optional[str] = None, co_owner_email: Optional[str] = None,
                     creation_date: Optional[str] = None, status: Optional[str] = None,
                     parent_department_id: Optional[str] = None, token: Optional[str] = None) -> str:
    """Create a new department.
    
    Args:
        name: Name of the department
        small_description: Small description
        manager_email: Email of the manager
        manager_assistant_email: Email of the manager assistant
        co_owner_email: Email of the co-owner
        creation_date: Creation date (YYYY-MM-DD)
        status: Department status (ACTIVE, DEPRECATED, RETIRED)
        parent_department_id: ID of parent department (for nested departments)
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {
            "name": name,
            "smallDescription": small_description,
            "managerEmail": manager_email,
            "managerAssistantEmail": manager_assistant_email,
            "coOwnerEmail": co_owner_email,
            "creationDate": ensure_date(creation_date),
            "status": status,
            "parentDepartmentId": parent_department_id
        }
        variables = {"input": input_data}
        result = client.execute(queries.CREATE_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error creating department: {str(e)}"


def update_department(department_id: str, name: Optional[str] = None,
                      small_description: Optional[str] = None, manager_email: Optional[str] = None,
                      manager_assistant_email: Optional[str] = None, co_owner_email: Optional[str] = None,
                      creation_date: Optional[str] = None, status: Optional[str] = None,
                      parent_department_id: Optional[str] = None, token: Optional[str] = None) -> str:
    """Update an existing department.
    
    Args:
        department_id: ID of the department to update
        name: New name
        small_description: New small description
        manager_email: New manager email
        manager_assistant_email: New manager assistant email
        co_owner_email: New co-owner email
        creation_date: New creation date (YYYY-MM-DD)
        status: New status
        parent_department_id: New parent department ID
        token: JWT token for authentication (from session state)
    """
    try:
        input_data = {}
        if name is not None:
            input_data["name"] = name
        if small_description is not None:
            input_data["smallDescription"] = small_description
        if manager_email is not None:
            input_data["managerEmail"] = manager_email
        if manager_assistant_email is not None:
            input_data["managerAssistantEmail"] = manager_assistant_email
        if co_owner_email is not None:
            input_data["coOwnerEmail"] = co_owner_email
        if creation_date is not None:
            input_data["creationDate"] = ensure_date(creation_date)
        if status is not None:
            input_data["status"] = status
        if parent_department_id is not None:
            input_data["parentDepartmentId"] = parent_department_id
        
        variables = {"id": department_id, "input": input_data}
        result = client.execute(queries.UPDATE_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating department: {str(e)}"


def assign_user_to_department(department_id: str, user_email: str, token: Optional[str] = None) -> str:
    """Assign a user to a department.
    
    Args:
        department_id: ID of the department
        user_email: Email of the user
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"departmentId": department_id, "userEmail": user_email}
        result = client.execute(queries.ASSIGN_USER_TO_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error assigning user to department: {str(e)}"


def delete_department(department_id: str, token: Optional[str] = None) -> str:
    """Delete a department.
    
    Args:
        department_id: ID of the department to delete
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": department_id}
        result = client.execute(queries.DELETE_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error deleting department: {str(e)}"


def set_department_manager(department_id: str, user_email: str, token: Optional[str] = None) -> str:
    """Set the manager of a department.
    
    Args:
        department_id: ID of the department
        user_email: Email of the manager
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"departmentId": department_id, "userEmail": user_email}
        result = client.execute(queries.SET_DEPARTMENT_MANAGER, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error setting department manager: {str(e)}"


def assign_manager_assistant(department_id: str, user_email: str, token: Optional[str] = None) -> str:
    """Assign a manager assistant to a department.
    
    Args:
        department_id: ID of the department
        user_email: Email of the manager assistant
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"departmentId": department_id, "userEmail": user_email}
        result = client.execute(queries.ASSIGN_MANAGER_ASSISTANT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error assigning manager assistant: {str(e)}"


def move_user_to_department(user_id: str, department_id: str, token: Optional[str] = None) -> str:
    """Move a user to a different department.
    
    Args:
        user_id: ID of the user
        department_id: ID of the target department
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"userId": user_id, "departmentId": department_id}
        result = client.execute(queries.MOVE_USER_TO_DEPARTMENT, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error moving user to department: {str(e)}"


# ===== TENANT TOOLS =====

def list_tenants(token: Optional[str] = None) -> str:
    """List all tenants.
    
    Args:
        token: JWT token for authentication (from session state)
    """
    try:
        result = client.execute(queries.GET_TENANTS, None, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error listing tenants: {str(e)}"


# ===== GOAL NOTE TOOLS =====

def create_goal_note(goal_id: str, content: str, token: Optional[str] = None) -> str:
    """Create a note for a goal.
    
    Args:
        goal_id: ID of the goal
        content: Content of the note
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"goalId": goal_id, "content": content}
        result = client.execute(queries.CREATE_GOAL_NOTE, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error creating goal note: {str(e)}"


def update_goal_note(note_id: str, content: str, token: Optional[str] = None) -> str:
    """Update a goal note.
    
    Args:
        note_id: ID of the note
        content: New content
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": note_id, "content": content}
        result = client.execute(queries.UPDATE_GOAL_NOTE, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error updating goal note: {str(e)}"


def delete_goal_note(note_id: str, token: Optional[str] = None) -> str:
    """Delete a goal note.
    
    Args:
        note_id: ID of the note to delete
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"id": note_id}
        result = client.execute(queries.DELETE_GOAL_NOTE, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error deleting goal note: {str(e)}"


# ===== BULK OPERATIONS =====

def bulk_upload_users(csv_data: str, token: Optional[str] = None) -> str:
    """Bulk upload users from CSV data.
    
    Args:
        csv_data: CSV data as string
        token: JWT token for authentication (from session state)
    """
    try:
        variables = {"csvData": csv_data}
        result = client.execute(queries.BULK_UPLOAD_USERS, variables, token=token)
        return json.dumps(result)
    except Exception as e:
        return f"Error bulk uploading users: {str(e)}"

