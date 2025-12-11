package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class QueryResolver implements GraphQLQueryResolver {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    // User queries
    public User user(Long id) {
        return userRepository.findByIdAndTenantId(id, getCurrentTenantId()).orElse(null);
    }

    public User userByEmail(String email) {
        return userRepository.findByEmailAndTenantId(email, getCurrentTenantId()).orElse(null);
    }

    public List<User> users() {
        return userRepository.findAllByTenantId(getCurrentTenantId());
    }

    public List<User> teamMembers(Long managerId) {
        Long tenantId = getCurrentTenantId();
        Optional<User> manager = userRepository.findByIdAndTenantId(managerId, tenantId);
        return manager.map(User::getTeamMembers)
                .map(members -> members.stream()
                        .filter(member -> member.getTenant().getId().equals(tenantId))
                        .toList())
                .orElse(List.of());
    }

    // Goal queries
    public Goal goal(Long id) {
        return goalRepository.findByIdAndTenantId(id, getCurrentTenantId()).orElse(null);
    }

    public List<Goal> goals() {
        return goalRepository.findAllByTenantId(getCurrentTenantId());
    }

    public List<Goal> goalsByOwner(String email) {
        return goalRepository.findByOwnerEmailAndTenantId(email, getCurrentTenantId());
    }

    public List<Goal> rootGoals() {
        return goalRepository.findByParentGoalIsNullAndTenantId(getCurrentTenantId());
    }

    // Department queries
    public Department department(Long id) {
        return departmentRepository.findByIdAndTenantId(id, getCurrentTenantId()).orElse(null);
    }

    public List<Department> departments() {
        return departmentRepository.findAllByTenantId(getCurrentTenantId());
    }

    public List<Department> rootDepartments() {
        return departmentRepository.findByParentDepartmentIsNullAndTenantId(getCurrentTenantId());
    }
}
