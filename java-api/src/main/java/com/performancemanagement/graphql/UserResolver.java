package com.performancemanagement.graphql;

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

    public Department department(User user) {
        return user.getDepartment();
    }

    public User manager(User user) {
        return user.getManager();
    }

    public List<User> teamMembers(User user) {
        return user.getTeamMembers().stream().toList();
    }

    public List<Goal> assignedGoals(User user) {
        return user.getAssignedGoals().stream().toList();
    }

    public List<Goal> ownedGoals(User user) {
        return user.getOwnedGoals().stream().toList();
    }
}
