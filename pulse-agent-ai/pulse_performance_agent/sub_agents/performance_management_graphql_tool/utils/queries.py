# GraphQL Queries and Mutations
# Based on pulse-java-api/src/main/resources/graphql/schema.graphqls

# ===== USER QUERIES =====

GET_USER = """
query GetUser($id: ID!) {
    user(id: $id) {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
        manager {
            id
            email
            firstName
            lastName
        }
        teamMembers {
            id
            email
            firstName
            lastName
        }
        assignedGoals {
            id
            shortDescription
            status
        }
        ownedGoals {
            id
            shortDescription
            status
        }
    }
}
"""

GET_USER_BY_EMAIL = """
query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
        manager {
            id
            email
            firstName
            lastName
        }
        teamMembers {
            id
            email
            firstName
            lastName
        }
        assignedGoals {
            id
            shortDescription
            status
        }
        ownedGoals {
            id
            shortDescription
            status
        }
    }
}
"""

GET_USERS = """
query GetUsers {
    users {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
        manager {
            id
            email
        }
    }
}
"""

GET_TEAM_MEMBERS = """
query GetTeamMembers($managerId: ID!) {
    teamMembers(managerId: $managerId) {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
    }
}
"""

# ===== GOAL QUERIES =====

GET_GOAL = """
query GetGoal($id: ID!) {
    goal(id: $id) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
            firstName
            lastName
        }
        creationDate
        completionDate
        assignedDate
        targetCompletionDate
        status
        parentGoal {
            id
            shortDescription
        }
        childGoals {
            id
            shortDescription
            status
        }
        assignedUsers {
            id
            email
            firstName
            lastName
        }
        locked
        confidential
        kpis {
            id
            description
            status
            completionPercentage
            dueDate
        }
        notes {
            id
            content
            author {
                id
                email
            }
            createdAt
            updatedAt
        }
    }
}
"""

GET_GOALS = """
query GetGoals {
    goals {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        completionDate
        status
        parentGoal {
            id
            shortDescription
        }
        childGoals {
            id
            shortDescription
        }
        assignedUsers {
            id
            email
        }
        locked
        confidential
    }
}
"""

GET_GOALS_BY_OWNER = """
query GetGoalsByOwner($email: String!) {
    goalsByOwner(email: $email) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        completionDate
        status
        parentGoal {
            id
            shortDescription
        }
        childGoals {
            id
            shortDescription
        }
        assignedUsers {
            id
            email
        }
        locked
        confidential
    }
}
"""

GET_ALL_GOALS_FOR_HR = """
query GetAllGoalsForHR {
    allGoalsForHR {
        id
        shortDescription
        longDescription
        owner {
            id
            email
            firstName
            lastName
        }
        creationDate
        completionDate
        status
        parentGoal {
            id
            shortDescription
        }
        assignedUsers {
            id
            email
        }
        locked
        confidential
    }
}
"""

GET_GOALS_PENDING_APPROVAL = """
query GetGoalsPendingApproval($departmentId: ID!) {
    goalsPendingApproval(departmentId: $departmentId) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        status
        parentGoal {
            id
            shortDescription
        }
        assignedUsers {
            id
            email
        }
    }
}
"""

GET_DEPARTMENT_MEMBERS_GOALS = """
query GetDepartmentMembersGoals($departmentId: ID!) {
    departmentMembersGoals(departmentId: $departmentId) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        completionDate
        status
        assignedUsers {
            id
            email
        }
        locked
        confidential
    }
}
"""

GET_GOAL_NOTES = """
query GetGoalNotes($goalId: ID!) {
    goalNotes(goalId: $goalId) {
        id
        goal {
            id
            shortDescription
        }
        author {
            id
            email
            firstName
            lastName
        }
        content
        createdAt
        updatedAt
    }
}
"""

# ===== DEPARTMENT QUERIES =====

GET_DEPARTMENT = """
query GetDepartment($id: ID!) {
    department(id: $id) {
        id
        name
        smallDescription
        manager {
            id
            email
            firstName
            lastName
        }
        managerAssistant {
            id
            email
            firstName
            lastName
        }
        coOwner {
            id
            email
            firstName
            lastName
        }
        creationDate
        status
        parentDepartment {
            id
            name
        }
        childDepartments {
            id
            name
            status
        }
        users {
            id
            email
            firstName
            lastName
            title
        }
    }
}
"""

GET_DEPARTMENTS = """
query GetDepartments {
    departments {
        id
        name
        smallDescription
        manager {
            id
            email
        }
        managerAssistant {
            id
            email
        }
        coOwner {
            id
            email
        }
        creationDate
        status
        parentDepartment {
            id
            name
        }
        childDepartments {
            id
            name
        }
        users {
            id
            email
        }
    }
}
"""

GET_ROOT_DEPARTMENTS = """
query GetRootDepartments {
    rootDepartments {
        id
        name
        smallDescription
        manager {
            id
            email
        }
        creationDate
        status
        childDepartments {
            id
            name
            status
        }
        users {
            id
            email
        }
    }
}
"""

GET_DEPARTMENTS_MANAGED_BY_ME = """
query GetDepartmentsManagedByMe {
    departmentsManagedByMe {
        id
        name
        smallDescription
        manager {
            id
            email
        }
        managerAssistant {
            id
            email
        }
        coOwner {
            id
            email
        }
        creationDate
        status
        parentDepartment {
            id
            name
        }
        childDepartments {
            id
            name
        }
        users {
            id
            email
        }
    }
}
"""

# ===== TENANT QUERIES =====

GET_TENANTS = """
query GetTenants {
    tenants {
        fqdn
        name
        active
    }
}
"""

# ===== USER MUTATIONS =====

CREATE_USER = """
mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
        manager {
            id
            email
        }
    }
}
"""

UPDATE_USER = """
mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
        id
        firstName
        lastName
        email
        title
        role
        department {
            id
            name
        }
        manager {
            id
            email
        }
    }
}
"""

DELETE_USER = """
mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
}
"""

SET_USER_MANAGER = """
mutation SetUserManager($userId: ID!, $managerId: ID) {
    setUserManager(userId: $userId, managerId: $managerId) {
        id
        email
        firstName
        lastName
        manager {
            id
            email
            firstName
            lastName
        }
    }
}
"""

# ===== GOAL MUTATIONS =====

CREATE_GOAL = """
mutation CreateGoal($input: GoalInput!) {
    createGoal(input: $input) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        completionDate
        assignedDate
        targetCompletionDate
        status
        parentGoal {
            id
            shortDescription
        }
        locked
        confidential
        kpis {
            id
            description
            status
            completionPercentage
            dueDate
        }
    }
}
"""

UPDATE_GOAL = """
mutation UpdateGoal($id: ID!, $input: GoalInput!) {
    updateGoal(id: $id, input: $input) {
        id
        shortDescription
        longDescription
        owner {
            id
            email
        }
        creationDate
        completionDate
        assignedDate
        targetCompletionDate
        status
        parentGoal {
            id
            shortDescription
        }
        locked
        confidential
        kpis {
            id
            description
            status
            completionPercentage
            dueDate
        }
    }
}
"""

ASSIGN_GOAL_TO_USER = """
mutation AssignGoalToUser($goalId: ID!, $userEmail: String!) {
    assignGoalToUser(goalId: $goalId, userEmail: $userEmail) {
        id
        shortDescription
        assignedUsers {
            id
            email
            firstName
            lastName
        }
    }
}
"""

UNASSIGN_GOAL_FROM_USER = """
mutation UnassignGoalFromUser($goalId: ID!, $userEmail: String!) {
    unassignGoalFromUser(goalId: $goalId, userEmail: $userEmail) {
        id
        shortDescription
        assignedUsers {
            id
            email
        }
    }
}
"""

LOCK_GOAL = """
mutation LockGoal($id: ID!) {
    lockGoal(id: $id) {
        id
        shortDescription
        locked
    }
}
"""

UNLOCK_GOAL = """
mutation UnlockGoal($id: ID!) {
    unlockGoal(id: $id) {
        id
        shortDescription
        locked
    }
}
"""

DELETE_GOAL = """
mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
}
"""

UPDATE_TARGET_COMPLETION_DATE = """
mutation UpdateTargetCompletionDate($goalId: ID!, $targetCompletionDate: String) {
    updateTargetCompletionDate(goalId: $goalId, targetCompletionDate: $targetCompletionDate) {
        id
        shortDescription
        targetCompletionDate
    }
}
"""

APPROVE_GOAL = """
mutation ApproveGoal($goalId: ID!) {
    approveGoal(goalId: $goalId) {
        id
        shortDescription
        status
    }
}
"""

# ===== KPI MUTATIONS =====

CREATE_KPI = """
mutation CreateKPI($goalId: ID!, $input: KPIInput!) {
    createKPI(goalId: $goalId, input: $input) {
        id
        description
        status
        completionPercentage
        dueDate
        goal {
            id
            shortDescription
        }
    }
}
"""

UPDATE_KPI = """
mutation UpdateKPI($id: ID!, $input: KPIUpdateInput!) {
    updateKPI(id: $id, input: $input) {
        id
        description
        status
        completionPercentage
        dueDate
        goal {
            id
            shortDescription
        }
    }
}
"""

DELETE_KPI = """
mutation DeleteKPI($id: ID!) {
    deleteKPI(id: $id)
}
"""

# ===== DEPARTMENT MUTATIONS =====

CREATE_DEPARTMENT = """
mutation CreateDepartment($input: DepartmentInput!) {
    createDepartment(input: $input) {
        id
        name
        smallDescription
        manager {
            id
            email
        }
        managerAssistant {
            id
            email
        }
        coOwner {
            id
            email
        }
        creationDate
        status
        parentDepartment {
            id
            name
        }
        users {
            id
            email
        }
    }
}
"""

UPDATE_DEPARTMENT = """
mutation UpdateDepartment($id: ID!, $input: DepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
        id
        name
        smallDescription
        manager {
            id
            email
        }
        managerAssistant {
            id
            email
        }
        coOwner {
            id
            email
        }
        creationDate
        status
        parentDepartment {
            id
            name
        }
        users {
            id
            email
        }
    }
}
"""

ASSIGN_USER_TO_DEPARTMENT = """
mutation AssignUserToDepartment($departmentId: ID!, $userEmail: String!) {
    assignUserToDepartment(departmentId: $departmentId, userEmail: $userEmail) {
        id
        name
        users {
            id
            email
            firstName
            lastName
        }
    }
}
"""

DELETE_DEPARTMENT = """
mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id)
}
"""

SET_DEPARTMENT_MANAGER = """
mutation SetDepartmentManager($departmentId: ID!, $userEmail: String!) {
    setDepartmentManager(departmentId: $departmentId, userEmail: $userEmail) {
        id
        name
        manager {
            id
            email
            firstName
            lastName
        }
    }
}
"""

ASSIGN_MANAGER_ASSISTANT = """
mutation AssignManagerAssistant($departmentId: ID!, $userEmail: String!) {
    assignManagerAssistant(departmentId: $departmentId, userEmail: $userEmail) {
        id
        name
        managerAssistant {
            id
            email
            firstName
            lastName
        }
    }
}
"""

MOVE_USER_TO_DEPARTMENT = """
mutation MoveUserToDepartment($userId: ID!, $departmentId: ID!) {
    moveUserToDepartment(userId: $userId, departmentId: $departmentId) {
        id
        name
        users {
            id
            email
            firstName
            lastName
        }
    }
}
"""

# ===== BULK OPERATIONS =====

BULK_UPLOAD_USERS = """
mutation BulkUploadUsers($csvData: String!) {
    bulkUploadUsers(csvData: $csvData) {
        totalRows
        usersCreated
        usersUpdated
        departmentsCreated
        departmentsUpdated
        errors
    }
}
"""

# ===== GOAL NOTE MUTATIONS =====

CREATE_GOAL_NOTE = """
mutation CreateGoalNote($goalId: ID!, $content: String!) {
    createGoalNote(goalId: $goalId, content: $content) {
        id
        goal {
            id
            shortDescription
        }
        author {
            id
            email
            firstName
            lastName
        }
        content
        createdAt
        updatedAt
    }
}
"""

UPDATE_GOAL_NOTE = """
mutation UpdateGoalNote($id: ID!, $content: String!) {
    updateGoalNote(id: $id, content: $content) {
        id
        goal {
            id
            shortDescription
        }
        author {
            id
            email
        }
        content
        createdAt
        updatedAt
    }
}
"""

DELETE_GOAL_NOTE = """
mutation DeleteGoalNote($id: ID!) {
    deleteGoalNote(id: $id)
}
"""


