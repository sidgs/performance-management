package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.dto.DepartmentDTO;
import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.Tenant;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.TeamRepository;
import com.performancemanagement.repository.TenantRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.DepartmentService;
import com.performancemanagement.service.GoalService;
import com.performancemanagement.service.GoalNoteService;
import com.performancemanagement.service.TeamService;
import com.performancemanagement.model.Team;
import com.performancemanagement.model.GoalNote;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class QueryResolver implements GraphQLQueryResolver {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private GoalService goalService;
    
    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private GoalNoteService goalNoteService;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamService teamService;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId(); // Returns null if no tenant context - tenant validation is disabled
    }

    // User queries
    public User user(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled - return null if no tenant context
        }
        return userRepository.findByIdAndTenantId(id, tenantId).orElse(null);
    }

    public User userByEmail(String email) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled - return null if no tenant context
        }
        return userRepository.findByEmailAndTenantId(email, tenantId).orElse(null);
    }

    public List<User> users() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        return userRepository.findAllByTenantId(tenantId);
    }

    public List<User> teamMembers(Long managerId) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        Optional<User> manager = userRepository.findByIdAndTenantId(managerId, tenantId);
        return manager.map(User::getTeamMembers)
                .map(members -> members.stream()
                        .filter(member -> member.getTenant().getFqdn().equals(tenantId))
                        .toList())
                .orElse(List.of());
    }

    // Goal queries
    public Goal goal(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled - return null if no tenant context
        }
        
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId).orElse(null);
        if (goal == null) {
            return null;
        }
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("You do not have permission to view this goal");
        }
        
        // Check authorization using GoalService helper method
        // We need to initialize lazy collections first
        Hibernate.initialize(goal.getOwner());
        Hibernate.initialize(goal.getAssignedUsers());
        if (goal.getOwner() != null) {
            Hibernate.initialize(goal.getOwner().getDepartment());
            Hibernate.initialize(goal.getOwner().getTeam());
        }
        if (goal.getAssignedUsers() != null) {
            goal.getAssignedUsers().forEach(user -> {
                Hibernate.initialize(user.getDepartment());
                Hibernate.initialize(user.getTeam());
            });
        }
        if (currentUser.getDepartment() != null) {
            Hibernate.initialize(currentUser.getDepartment());
        }
        if (currentUser.getTeam() != null) {
            Hibernate.initialize(currentUser.getTeam());
        }
        
        // Use GoalService to check authorization
        if (!goalService.canUserViewGoal(currentUser, goal)) {
            throw new IllegalStateException("You do not have permission to view this goal");
        }
        
        return goal;
    }

    @Transactional(readOnly = true)
    public List<Goal> goals() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            // If no user is logged in, return empty list
            return List.of();
        }
        
        // Fetch all goals for the tenant
        List<Goal> allGoals = goalRepository.findAllByTenantId(tenantId);
        
        // Initialize lazy collections before filtering
        allGoals.forEach(goal -> {
            Hibernate.initialize(goal.getAssignedUsers());
            Hibernate.initialize(goal.getOwner());
            if (goal.getOwner() != null) {
                Hibernate.initialize(goal.getOwner().getDepartment());
                Hibernate.initialize(goal.getOwner().getTeam());
            }
            if (goal.getAssignedUsers() != null) {
                goal.getAssignedUsers().forEach(user -> {
                    Hibernate.initialize(user.getDepartment());
                    Hibernate.initialize(user.getTeam());
                });
            }
        });
        
        // Initialize current user's relationships
        if (currentUser.getDepartment() != null) {
            Hibernate.initialize(currentUser.getDepartment());
        }
        if (currentUser.getTeam() != null) {
            Hibernate.initialize(currentUser.getTeam());
        }
        
        // Filter goals based on RBAC rules using GoalService helper
        return allGoals.stream()
                .filter(goal -> {
                    // First check if user can view the goal based on RBAC rules
                    if (!goalService.canUserViewGoal(currentUser, goal)) {
                        return false;
                    }
                    
                    // Then apply confidential goal filtering: only show if user is owner or assigned
                    if (goal.getConfidential() != null && goal.getConfidential()) {
                        boolean isOwner = goal.getOwner() != null && 
                                         goal.getOwner().getId().equals(currentUser.getId());
                        boolean isAssigned = goal.getAssignedUsers() != null && 
                                           goal.getAssignedUsers().stream()
                                                   .anyMatch(user -> user.getId().equals(currentUser.getId()));
                        return isOwner || isAssigned;
                    }
                    
                    // Non-confidential goal that passed RBAC check
                    return true;
                })
                .toList();
    }
    
    public List<Goal> allGoalsForHR() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        // Check if user is HR admin
        if (!authorizationService.isHrAdmin()) {
            throw new IllegalStateException("HR_ADMIN role required to access all goals");
        }
        
        // Get all goals for the tenant
        return goalRepository.findAllByTenantId(tenantId);
    }

    public List<Goal> goalsByOwner(String email) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return List.of(); // No user logged in, return empty list
        }
        
        // Fetch goals by owner
        List<Goal> goals = goalRepository.findByOwnerEmailAndTenantId(email, tenantId);
        
        // Initialize lazy collections before filtering
        goals.forEach(goal -> {
            Hibernate.initialize(goal.getAssignedUsers());
            Hibernate.initialize(goal.getOwner());
            if (goal.getOwner() != null) {
                Hibernate.initialize(goal.getOwner().getDepartment());
                Hibernate.initialize(goal.getOwner().getTeam());
            }
            if (goal.getAssignedUsers() != null) {
                goal.getAssignedUsers().forEach(user -> {
                    Hibernate.initialize(user.getDepartment());
                    Hibernate.initialize(user.getTeam());
                });
            }
        });
        
        // Initialize current user's relationships
        if (currentUser.getDepartment() != null) {
            Hibernate.initialize(currentUser.getDepartment());
        }
        if (currentUser.getTeam() != null) {
            Hibernate.initialize(currentUser.getTeam());
        }
        
        // Filter goals based on RBAC rules - only return goals the user can view
        return goals.stream()
                .filter(goal -> goalService.canUserViewGoal(currentUser, goal))
                .toList();
    }

    // Department queries
    public Department department(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled - return null if no tenant context
        }
        return departmentRepository.findByIdAndTenantId(id, tenantId).orElse(null);
    }

    public List<Department> departments() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        return departmentRepository.findAllByTenantId(tenantId);
    }

    public List<Department> rootDepartments() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list if no tenant context
        }
        return departmentRepository.findByParentDepartmentIsNullAndTenantId(tenantId);
    }

    public List<Department> departmentsManagedByMe() {
        List<DepartmentDTO> dtos = departmentService.getDepartmentsManagedByMe();
        String tenantId = getCurrentTenantId();
        return dtos.stream()
                .map(dto -> departmentRepository.findByIdAndTenantId(dto.getId(), tenantId).orElse(null))
                .filter(d -> d != null)
                .collect(Collectors.toList());
    }

    public List<Goal> goalsPendingApproval(Long departmentId) {
        List<GoalDTO> dtos = goalService.getGoalsPendingApprovalForDepartment(departmentId);
        String tenantId = getCurrentTenantId();
        return dtos.stream()
                .map(dto -> goalRepository.findByIdAndTenantId(dto.getId(), tenantId).orElse(null))
                .filter(g -> g != null)
                .collect(Collectors.toList());
    }

    public List<Goal> departmentMembersGoals(Long departmentId) {
        List<GoalDTO> dtos = goalService.getDepartmentMembersGoals(departmentId);
        String tenantId = getCurrentTenantId();
        return dtos.stream()
                .map(dto -> goalRepository.findByIdAndTenantId(dto.getId(), tenantId).orElse(null))
                .filter(g -> g != null)
                .collect(Collectors.toList());
    }

    // Goal note queries
    public List<GoalNote> goalNotes(Long goalId) {
        return goalNoteService.getNotesByGoalId(goalId);
    }

    // Team queries
    public Team team(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null;
        }
        return teamRepository.findByIdAndTenantId(id, tenantId).orElse(null);
    }

    public List<Team> teams() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return teamRepository.findByTenantId(tenantId);
    }

    public List<Team> teamsByDepartment(Long departmentId) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return teamRepository.findByDepartmentIdAndTenantId(departmentId, tenantId);
    }

    // Tenant queries
    public List<Tenant> tenants() {
        // Return all tenants (admin operation - not filtered by tenant context)
        return tenantRepository.findAll();
    }
}
