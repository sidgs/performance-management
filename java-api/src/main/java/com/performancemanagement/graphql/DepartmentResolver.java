package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
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
    public User owner(Department department) {
        // Re-attach the entity to the current session
        department = entityManager.merge(department);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return owner if available
            User owner = department.getOwner();
            if (owner != null) {
                Hibernate.initialize(owner);
                Hibernate.initialize(owner.getTenant());
            }
            return owner;
        }
        User owner = department.getOwner();
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
}
