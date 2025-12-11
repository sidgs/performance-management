package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GoalResolver implements GraphQLResolver<Goal> {

    private Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    public User owner(Goal goal) {
        User owner = goal.getOwner();
        if (owner != null && owner.getTenant().getId().equals(getCurrentTenantId())) {
            return owner;
        }
        return null;
    }

    public Goal parentGoal(Goal goal) {
        Goal parent = goal.getParentGoal();
        if (parent != null && parent.getTenant().getId().equals(getCurrentTenantId())) {
            return parent;
        }
        return null;
    }

    public List<Goal> childGoals(Goal goal) {
        Long tenantId = getCurrentTenantId();
        return goal.getChildGoals().stream()
                .filter(child -> child.getTenant().getId().equals(tenantId))
                .toList();
    }

    public List<User> assignedUsers(Goal goal) {
        Long tenantId = getCurrentTenantId();
        return goal.getAssignedUsers().stream()
                .filter(user -> user.getTenant().getId().equals(tenantId))
                .toList();
    }
}
