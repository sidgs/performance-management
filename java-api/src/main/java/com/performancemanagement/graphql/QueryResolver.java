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
import com.performancemanagement.repository.TenantRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.DepartmentService;
import com.performancemanagement.service.GoalService;
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
        return goalRepository.findByIdAndTenantId(id, tenantId).orElse(null);
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
        
        // Filter goals to only include:
        // 1. Goals owned by the current user
        // 2. Goals assigned to the current user
        // 3. Goals owned by users in the current user's department
        // 4. Goals assigned to users in the current user's department
        Department userDepartment = currentUser.getDepartment();
        List<Goal> goals;
        if (userDepartment != null) {
            goals = goalRepository.findGoalsForUserAndDepartment(
                tenantId, 
                currentUser.getId(), 
                userDepartment.getId()
            );
        } else {
            // User has no department, only return goals owned by or assigned to the user
            goals = goalRepository.findGoalsForUser(tenantId, currentUser.getId());
        }
        
        // Initialize lazy collections before filtering
        goals.forEach(goal -> {
            Hibernate.initialize(goal.getAssignedUsers());
            Hibernate.initialize(goal.getOwner());
        });
        
        // Filter confidential goals: only show if user is owner or assigned
        return goals.stream()
                .filter(goal -> {
                    if (goal.getConfidential() != null && goal.getConfidential()) {
                        // Confidential goal: only show if user is owner or assigned
                        boolean isOwner = goal.getOwner().getId().equals(currentUser.getId());
                        boolean isAssigned = goal.getAssignedUsers().stream()
                                .anyMatch(user -> user.getId().equals(currentUser.getId()));
                        return isOwner || isAssigned;
                    }
                    // Non-confidential goal: show based on existing department filtering
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
        return goalRepository.findByOwnerEmailAndTenantId(email, tenantId);
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

    // Tenant queries
    public List<Tenant> tenants() {
        // Return all tenants (admin operation - not filtered by tenant context)
        return tenantRepository.findAll();
    }
}
