package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.KPIRepository;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Component
public class GoalResolver implements GraphQLResolver<Goal> {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private KPIRepository kpiRepository;

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
    
    /**
     * Check if current user can view confidential goal details
     */
    private boolean canViewConfidentialGoal(Goal goal) {
        if (goal.getConfidential() == null || !goal.getConfidential()) {
            return true; // Not confidential, can view
        }
        
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        // Check if user is owner
        boolean isOwner = goal.getOwner() != null && 
                         Objects.equals(goal.getOwner().getId(), currentUser.getId());
        
        // Check if user is assigned
        boolean isAssigned = goal.getAssignedUsers().stream()
                .anyMatch(user -> Objects.equals(user.getId(), currentUser.getId()));
        
        return isOwner || isAssigned;
    }
    
    @Transactional(readOnly = true)
    public String shortDescription(Goal goal) {
        goal = entityManager.merge(goal);
        if (!canViewConfidentialGoal(goal)) {
            return "Confidential Goal";
        }
        return goal.getShortDescription();
    }
    
    @Transactional(readOnly = true)
    public String longDescription(Goal goal) {
        goal = entityManager.merge(goal);
        if (!canViewConfidentialGoal(goal)) {
            return "This goal is confidential and you do not have access to view its details.";
        }
        return goal.getLongDescription();
    }
}
