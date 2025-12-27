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
public class DepartmentResolver implements GraphQLResolver<Department> {

    @Autowired
    private EntityManager entityManager;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId(); // Returns null if no tenant context - tenant validation is disabled
    }

    @Transactional(readOnly = true)
    public User manager(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return manager if available
            User manager = department.getManager();
            if (manager != null) {
                Hibernate.initialize(manager);
                Hibernate.initialize(manager.getTenant());
            }
            return manager;
        }
        User manager = department.getManager();
        if (manager != null) {
            Hibernate.initialize(manager);
            Hibernate.initialize(manager.getTenant());
            if (manager.getTenant().getFqdn().equals(tenantId)) {
                return manager;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User managerAssistant(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return managerAssistant if available
            User managerAssistant = department.getManagerAssistant();
            if (managerAssistant != null) {
                Hibernate.initialize(managerAssistant);
                Hibernate.initialize(managerAssistant.getTenant());
            }
            return managerAssistant;
        }
        User managerAssistant = department.getManagerAssistant();
        if (managerAssistant != null) {
            Hibernate.initialize(managerAssistant);
            Hibernate.initialize(managerAssistant.getTenant());
            if (managerAssistant.getTenant().getFqdn().equals(tenantId)) {
                return managerAssistant;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User coOwner(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return coOwner if available
            User coOwner = department.getCoOwner();
            if (coOwner != null) {
                Hibernate.initialize(coOwner);
                Hibernate.initialize(coOwner.getTenant());
            }
            return coOwner;
        }
        User coOwner = department.getCoOwner();
        if (coOwner != null) {
            Hibernate.initialize(coOwner);
            Hibernate.initialize(coOwner.getTenant());
            if (coOwner.getTenant().getFqdn().equals(tenantId)) {
                return coOwner;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public Department parentDepartment(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return parent if available
            Department parent = department.getParentDepartment();
            if (parent != null) {
                Hibernate.initialize(parent);
                Hibernate.initialize(parent.getTenant());
            }
            return parent;
        }
        Department parent = department.getParentDepartment();
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
    public List<Department> childDepartments(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        Hibernate.initialize(department.getChildDepartments());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all child departments
            return department.getChildDepartments().stream()
                    .peek(child -> {
                        Hibernate.initialize(child);
                        Hibernate.initialize(child.getTenant());
                    })
                    .toList();
        }
        return department.getChildDepartments().stream()
                .peek(child -> {
                    Hibernate.initialize(child);
                    Hibernate.initialize(child.getTenant());
                })
                .filter(child -> child.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<User> users(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        Hibernate.initialize(department.getUsers());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all users
            return department.getUsers().stream()
                    .peek(user -> {
                        Hibernate.initialize(user);
                        Hibernate.initialize(user.getTenant());
                    })
                    .toList();
        }
        return department.getUsers().stream()
                .peek(user -> {
                    Hibernate.initialize(user);
                    Hibernate.initialize(user.getTenant());
                })
                .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Team> teams(Department department) {
        department = entityManager.merge(department);
        Hibernate.initialize(department.getTeams());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return department.getTeams().stream()
                    .peek(team -> {
                        Hibernate.initialize(team);
                        Hibernate.initialize(team.getTenant());
                    })
                    .toList();
        }
        return department.getTeams().stream()
                .peek(team -> {
                    Hibernate.initialize(team);
                    Hibernate.initialize(team.getTenant());
                })
                .filter(team -> team.getTenant().getFqdn().equals(tenantId))
                .toList();
    }
}
