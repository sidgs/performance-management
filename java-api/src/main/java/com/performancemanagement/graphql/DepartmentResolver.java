package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DepartmentResolver implements GraphQLResolver<Department> {

    private Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    public User owner(Department department) {
        User owner = department.getOwner();
        if (owner != null && owner.getTenant().getId().equals(getCurrentTenantId())) {
            return owner;
        }
        return null;
    }

    public User coOwner(Department department) {
        User coOwner = department.getCoOwner();
        if (coOwner != null && coOwner.getTenant().getId().equals(getCurrentTenantId())) {
            return coOwner;
        }
        return null;
    }

    public Department parentDepartment(Department department) {
        Department parent = department.getParentDepartment();
        if (parent != null && parent.getTenant().getId().equals(getCurrentTenantId())) {
            return parent;
        }
        return null;
    }

    public List<Department> childDepartments(Department department) {
        Long tenantId = getCurrentTenantId();
        return department.getChildDepartments().stream()
                .filter(child -> child.getTenant().getId().equals(tenantId))
                .toList();
    }

    public List<User> users(Department department) {
        Long tenantId = getCurrentTenantId();
        return department.getUsers().stream()
                .filter(user -> user.getTenant().getId().equals(tenantId))
                .toList();
    }
}
