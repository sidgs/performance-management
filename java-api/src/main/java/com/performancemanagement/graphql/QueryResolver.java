package com.performancemanagement.graphql;

import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class QueryResolver implements GraphQLQueryResolver {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // User queries
    public User user(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User userByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> users() {
        return userRepository.findAll();
    }

    public List<User> teamMembers(Long managerId) {
        Optional<User> manager = userRepository.findById(managerId);
        return manager.map(User::getTeamMembers).map(members -> members.stream().toList()).orElse(List.of());
    }

    // Goal queries
    public Goal goal(Long id) {
        return goalRepository.findById(id).orElse(null);
    }

    public List<Goal> goals() {
        return goalRepository.findAll();
    }

    public List<Goal> goalsByOwner(String email) {
        return goalRepository.findByOwnerEmail(email);
    }

    public List<Goal> rootGoals() {
        return goalRepository.findByParentGoalIsNull();
    }

    // Department queries
    public Department department(Long id) {
        return departmentRepository.findById(id).orElse(null);
    }

    public List<Department> departments() {
        return departmentRepository.findAll();
    }

    public List<Department> rootDepartments() {
        return departmentRepository.findByParentDepartmentIsNull();
    }
}
