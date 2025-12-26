package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.GoalNote;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.KPIRepository;
import com.performancemanagement.service.GoalNoteService;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class GoalResolver implements GraphQLResolver<Goal> {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private KPIRepository kpiRepository;

    @Autowired
    private GoalNoteService goalNoteService;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId(); // Returns null if no tenant context - tenant validation is disabled
    }

    @Transactional(readOnly = true)
    public User owner(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return owner if available
            User owner = goal.getOwner();
            if (owner != null) {
                Hibernate.initialize(owner);
                Hibernate.initialize(owner.getTenant());
            }
            return owner;
        }
        User owner = goal.getOwner();
        if (owner != null) {
            Hibernate.initialize(owner);
            Hibernate.initialize(owner.getTenant());
            if (owner.getTenant().getFqdn().equals(tenantId)) {
                return owner;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public Goal parentGoal(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return parent if available
            Goal parent = goal.getParentGoal();
            if (parent != null) {
                Hibernate.initialize(parent);
                Hibernate.initialize(parent.getTenant());
            }
            return parent;
        }
        Goal parent = goal.getParentGoal();
        if (parent != null) {
            Hibernate.initialize(parent);
            Hibernate.initialize(parent.getTenant());
            if (parent.getTenant().getFqdn().equals(tenantId)) {
                return parent;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<Goal> childGoals(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        Hibernate.initialize(goal.getChildGoals());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all child goals
            return goal.getChildGoals().stream()
                    .peek(child -> {
                        Hibernate.initialize(child);
                        Hibernate.initialize(child.getTenant());
                    })
                    .toList();
        }
        return goal.getChildGoals().stream()
                .peek(child -> {
                    Hibernate.initialize(child);
                    Hibernate.initialize(child.getTenant());
                })
                .filter(child -> child.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<User> assignedUsers(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        Hibernate.initialize(goal.getAssignedUsers());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all assigned users
            return goal.getAssignedUsers().stream()
                    .peek(user -> {
                        Hibernate.initialize(user);
                        Hibernate.initialize(user.getTenant());
                    })
                    .toList();
        }
        return goal.getAssignedUsers().stream()
                .peek(user -> {
                    Hibernate.initialize(user);
                    Hibernate.initialize(user.getTenant());
                })
                .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<KPI> kpis(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all KPIs
            Hibernate.initialize(goal.getKpis());
            return goal.getKpis().stream()
                    .peek(kpi -> {
                        Hibernate.initialize(kpi);
                        Hibernate.initialize(kpi.getTenant());
                    })
                    .toList();
        }
        // Use repository to get KPIs filtered by tenant
        return kpiRepository.findByGoalIdAndTenantId(goal.getId(), tenantId);
    }

    @Transactional(readOnly = true)
    public List<GoalNote> notes(Goal goal) {
        // Re-attach the entity to the current session
        goal = entityManager.merge(goal);
        // Use service to get notes with authorization filtering
        return goalNoteService.getNotesByGoalId(goal.getId());
    }
}
