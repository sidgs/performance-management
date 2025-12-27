package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Team;
import com.performancemanagement.model.User;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class TeamResolver implements GraphQLResolver<Team> {

    @Autowired
    private EntityManager entityManager;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId();
    }

    @Transactional(readOnly = true)
    public Department department(Team team) {
        team = entityManager.merge(team);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            Department dept = team.getDepartment();
            if (dept != null) {
                Hibernate.initialize(dept);
                Hibernate.initialize(dept.getTenant());
            }
            return dept;
        }
        Department dept = team.getDepartment();
        if (dept != null) {
            Hibernate.initialize(dept);
            Hibernate.initialize(dept.getTenant());
            if (dept.getTenant().getFqdn().equals(tenantId)) {
                return dept;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User teamLead(Team team) {
        team = entityManager.merge(team);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            User lead = team.getTeamLead();
            if (lead != null) {
                Hibernate.initialize(lead);
                Hibernate.initialize(lead.getTenant());
            }
            return lead;
        }
        User lead = team.getTeamLead();
        if (lead != null) {
            Hibernate.initialize(lead);
            Hibernate.initialize(lead.getTenant());
            if (lead.getTenant().getFqdn().equals(tenantId)) {
                return lead;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<User> users(Team team) {
        team = entityManager.merge(team);
        Hibernate.initialize(team.getUsers());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return team.getUsers().stream()
                    .peek(user -> {
                        Hibernate.initialize(user);
                        Hibernate.initialize(user.getTenant());
                    })
                    .toList();
        }
        return team.getUsers().stream()
                .peek(user -> {
                    Hibernate.initialize(user);
                    Hibernate.initialize(user.getTenant());
                })
                .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                .toList();
    }
}

