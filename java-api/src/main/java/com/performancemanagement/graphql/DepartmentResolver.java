package com.performancemanagement.graphql;

import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DepartmentResolver implements GraphQLResolver<Department> {

    public User owner(Department department) {
        return department.getOwner();
    }

    public User coOwner(Department department) {
        return department.getCoOwner();
    }

    public Department parentDepartment(Department department) {
        return department.getParentDepartment();
    }

    public List<Department> childDepartments(Department department) {
        return department.getChildDepartments().stream().toList();
    }

    public List<User> users(Department department) {
        return department.getUsers().stream().toList();
    }
}
