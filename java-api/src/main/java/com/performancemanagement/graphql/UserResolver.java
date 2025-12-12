package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserResolver implements GraphQLResolver<User> {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private GoalRepository goalRepository;

    private Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    public Department department(User user) {
        Department dept = user.getDepartment();
        if (dept != null && dept.getTenant().getId().equals(getCurrentTenantId())) {
            return dept;
        }
        return null;
    }

    public User manager(User user) {
        User manager = user.getManager();
        if (manager != null && manager.getTenant().getId().equals(getCurrentTenantId())) {
            return manager;
        }
        return null;
    }

    public List<User> teamMembers(User user) {
        Long tenantId = getCurrentTenantId();
        return user.getTeamMembers().stream()
                .filter(member -> member.getTenant().getId().equals(tenantId))
                .toList();
    }

    public List<Goal> assignedGoals(User user) {
        Long tenantId = getCurrentTenantId();
        return user.getAssignedGoals().stream()
                .filter(goal -> goal.getTenant().getId().equals(tenantId))
                .toList();
    }

    public List<Goal> ownedGoals(User user) {
        Long tenantId = getCurrentTenantId();
        return user.getOwnedGoals().stream()
                .filter(goal -> goal.getTenant().getId().equals(tenantId))
                .toList();
    }
}
