package com.performancemanagement.graphql;

import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.DepartmentService;
import com.performancemanagement.service.GoalService;
import com.performancemanagement.service.UserService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class MutationResolver implements GraphQLMutationResolver {

    @Autowired
    private UserService userService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    // User mutations
    public User createUser(UserInput input) {
        var userDTO = new com.performancemanagement.dto.UserDTO();
        userDTO.setFirstName(input.getFirstName());
        userDTO.setLastName(input.getLastName());
        userDTO.setEmail(input.getEmail());
        userDTO.setTitle(input.getTitle());
        userDTO.setManagerId(input.getManagerId());
        
        var created = userService.createUser(userDTO);
        return userRepository.findById(created.getId()).orElse(null);
    }

    public User updateUser(Long id, UserInput input) {
        var userDTO = new com.performancemanagement.dto.UserDTO();
        userDTO.setFirstName(input.getFirstName());
        userDTO.setLastName(input.getLastName());
        userDTO.setEmail(input.getEmail());
        userDTO.setTitle(input.getTitle());
        userDTO.setManagerId(input.getManagerId());
        
        var updated = userService.updateUser(id, userDTO);
        return userRepository.findById(updated.getId()).orElse(null);
    }

    public Boolean deleteUser(Long id) {
        try {
            userService.deleteUser(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Goal mutations
    public Goal createGoal(GoalInput input) {
        var goalDTO = new com.performancemanagement.dto.GoalDTO();
        goalDTO.setShortDescription(input.getShortDescription());
        goalDTO.setLongDescription(input.getLongDescription());
        goalDTO.setOwnerEmail(input.getOwnerEmail());
        goalDTO.setStatus(input.getStatus());
        
        if (input.getCreationDate() != null) {
            goalDTO.setCreationDate(LocalDate.parse(input.getCreationDate()));
        }
        if (input.getCompletionDate() != null) {
            goalDTO.setCompletionDate(LocalDate.parse(input.getCompletionDate()));
        }
        goalDTO.setParentGoalId(input.getParentGoalId());
        
        var created = goalService.createGoal(goalDTO);
        return goalRepository.findById(created.getId()).orElse(null);
    }

    public Goal updateGoal(Long id, GoalInput input) {
        var goalDTO = new com.performancemanagement.dto.GoalDTO();
        goalDTO.setShortDescription(input.getShortDescription());
        goalDTO.setLongDescription(input.getLongDescription());
        goalDTO.setStatus(input.getStatus());
        
        if (input.getCompletionDate() != null) {
            goalDTO.setCompletionDate(LocalDate.parse(input.getCompletionDate()));
        }
        goalDTO.setParentGoalId(input.getParentGoalId());
        
        var updated = goalService.updateGoal(id, goalDTO);
        return goalRepository.findById(updated.getId()).orElse(null);
    }

    public Goal assignGoalToUser(Long goalId, String userEmail) {
        var goalDTO = goalService.assignGoalToUser(goalId, userEmail);
        return goalRepository.findById(goalDTO.getId()).orElse(null);
    }

    public Boolean deleteGoal(Long id) {
        try {
            goalService.deleteGoal(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Department mutations
    public Department createDepartment(DepartmentInput input) {
        var deptDTO = new com.performancemanagement.dto.DepartmentDTO();
        deptDTO.setName(input.getName());
        deptDTO.setSmallDescription(input.getSmallDescription());
        deptDTO.setOwnerEmail(input.getOwnerEmail());
        deptDTO.setCoOwnerEmail(input.getCoOwnerEmail());
        deptDTO.setStatus(input.getStatus());
        
        if (input.getCreationDate() != null) {
            deptDTO.setCreationDate(LocalDate.parse(input.getCreationDate()));
        }
        deptDTO.setParentDepartmentId(input.getParentDepartmentId());
        
        var created = departmentService.createDepartment(deptDTO);
        return departmentRepository.findById(created.getId()).orElse(null);
    }

    public Department updateDepartment(Long id, DepartmentInput input) {
        var deptDTO = new com.performancemanagement.dto.DepartmentDTO();
        deptDTO.setName(input.getName());
        deptDTO.setSmallDescription(input.getSmallDescription());
        deptDTO.setCoOwnerEmail(input.getCoOwnerEmail());
        deptDTO.setStatus(input.getStatus());
        deptDTO.setParentDepartmentId(input.getParentDepartmentId());
        
        var updated = departmentService.updateDepartment(id, deptDTO);
        return departmentRepository.findById(updated.getId()).orElse(null);
    }

    public Department assignUserToDepartment(Long departmentId, String userEmail) {
        var deptDTO = departmentService.assignUserToDepartment(departmentId, userEmail);
        return departmentRepository.findById(deptDTO.getId()).orElse(null);
    }

    public Boolean deleteDepartment(Long id) {
        try {
            departmentService.deleteDepartment(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Inner classes for GraphQL input types
    public static class UserInput {
        private String firstName;
        private String lastName;
        private String email;
        private String title;
        private Long managerId;
        private Long departmentId;

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    }

    public static class GoalInput {
        private String shortDescription;
        private String longDescription;
        private String ownerEmail;
        private String creationDate;
        private String completionDate;
        private Goal.GoalStatus status;
        private Long parentGoalId;

        // Getters and setters
        public String getShortDescription() { return shortDescription; }
        public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
        public String getLongDescription() { return longDescription; }
        public void setLongDescription(String longDescription) { this.longDescription = longDescription; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
        public String getCreationDate() { return creationDate; }
        public void setCreationDate(String creationDate) { this.creationDate = creationDate; }
        public String getCompletionDate() { return completionDate; }
        public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }
        public Goal.GoalStatus getStatus() { return status; }
        public void setStatus(Goal.GoalStatus status) { this.status = status; }
        public Long getParentGoalId() { return parentGoalId; }
        public void setParentGoalId(Long parentGoalId) { this.parentGoalId = parentGoalId; }
    }

    public static class DepartmentInput {
        private String name;
        private String smallDescription;
        private String ownerEmail;
        private String coOwnerEmail;
        private String creationDate;
        private Department.DepartmentStatus status;
        private Long parentDepartmentId;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSmallDescription() { return smallDescription; }
        public void setSmallDescription(String smallDescription) { this.smallDescription = smallDescription; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
        public String getCoOwnerEmail() { return coOwnerEmail; }
        public void setCoOwnerEmail(String coOwnerEmail) { this.coOwnerEmail = coOwnerEmail; }
        public String getCreationDate() { return creationDate; }
        public void setCreationDate(String creationDate) { this.creationDate = creationDate; }
        public Department.DepartmentStatus getStatus() { return status; }
        public void setStatus(Department.DepartmentStatus status) { this.status = status; }
        public Long getParentDepartmentId() { return parentDepartmentId; }
        public void setParentDepartmentId(Long parentDepartmentId) { this.parentDepartmentId = parentDepartmentId; }
    }
}
