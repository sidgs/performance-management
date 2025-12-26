package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class KPIResolver implements GraphQLResolver<KPI> {

    @Autowired
    private EntityManager entityManager;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId();
    }

    @Transactional(readOnly = true)
    public Goal goal(KPI kpi) {
        kpi = entityManager.merge(kpi);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            Goal goal = kpi.getGoal();
            if (goal != null) {
                Hibernate.initialize(goal);
                Hibernate.initialize(goal.getTenant());
            }
            return goal;
        }
        Goal goal = kpi.getGoal();
        if (goal != null) {
            Hibernate.initialize(goal);
            Hibernate.initialize(goal.getTenant());
            if (goal.getTenant().getFqdn().equals(tenantId)) {
                return goal;
            }
        }
        return null;
    }
}


