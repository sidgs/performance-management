package com.performancemanagement.service;

import com.performancemanagement.config.UserContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Simple role-based authorization checks for the application.
 *
 * Currently, authorization is based on the per-request {@link UserContext},
 * which is populated by {@link com.performancemanagement.config.JwtAuthenticationFilter} based on the JWT token or X-User-Email header.
 */
@Service
public class AuthorizationService {

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Ensure the current user has the EPM_ADMIN role.
     * Throws an {@link IllegalStateException} if the user is missing or not an admin.
     */
    public void requireEpmAdmin() {
        User currentUser = UserContext.getCurrentUser();

        if (currentUser == null) {
            throw new IllegalStateException("Missing current user context. X-User-Email header is required.");
        }

        if (currentUser.getRole() == null || currentUser.getRole() != User.Role.EPM_ADMIN) {
            throw new IllegalStateException("EPM_ADMIN role required to perform this operation.");
        }
    }

    /**
     * Check if the current user has the EPM_ADMIN role.
     * @return true if the user is an admin, false otherwise
     */
    public boolean isEpmAdmin() {
        User currentUser = UserContext.getCurrentUser();
        return currentUser != null && 
               currentUser.getRole() != null && 
               currentUser.getRole() == User.Role.EPM_ADMIN;
    }

    /**
     * Ensure the current user has the HR_ADMIN role.
     * Throws an {@link IllegalStateException} if the user is missing or not an HR admin.
     */
    public void requireHrAdmin() {
        User currentUser = UserContext.getCurrentUser();

        if (currentUser == null) {
            throw new IllegalStateException("Missing current user context. X-User-Email header is required.");
        }

        if (currentUser.getRole() == null || currentUser.getRole() != User.Role.HR_ADMIN) {
            throw new IllegalStateException("HR_ADMIN role required to perform this operation.");
        }
    }

    /**
     * Check if the current user has the HR_ADMIN role.
     * @return true if the user is an HR admin, false otherwise
     */
    public boolean isHrAdmin() {
        User currentUser = UserContext.getCurrentUser();
        return currentUser != null && 
               currentUser.getRole() != null && 
               currentUser.getRole() == User.Role.HR_ADMIN;
    }

    /**
     * Ensure the current user is a manager of the specified department.
     * Throws an {@link IllegalStateException} if the user is missing or not the department manager.
     */
    public void requireDepartmentManager(Long departmentId) {
        User currentUser = UserContext.getCurrentUser();

        if (currentUser == null) {
            throw new IllegalStateException("Missing current user context. X-User-Email header is required.");
        }

        if (!isDepartmentManager(departmentId)) {
            throw new IllegalStateException("User must be the manager of this department to perform this operation.");
        }
    }

    /**
     * Check if the current user is a manager of the specified department.
     * @param departmentId The department ID to check
     * @return true if the user is the department manager, false otherwise
     */
    public boolean isDepartmentManager(Long departmentId) {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        Department department = departmentRepository.findById(departmentId).orElse(null);
        if (department == null) {
            return false;
        }

        return department.getManager() != null && 
               Objects.equals(department.getManager().getId(), currentUser.getId());
    }

    /**
     * Check if the current user is a manager assistant of the specified department.
     * @param departmentId The department ID to check
     * @return true if the user is the department manager assistant, false otherwise
     */
    public boolean isManagerAssistant(Long departmentId) {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        Department department = departmentRepository.findById(departmentId).orElse(null);
        if (department == null) {
            return false;
        }

        return department.getManagerAssistant() != null && 
               Objects.equals(department.getManagerAssistant().getId(), currentUser.getId());
    }

    /**
     * Check if the current user can manage department goals (either manager or assistant).
     * @param departmentId The department ID to check
     * @return true if the user can manage goals, false otherwise
     */
    public boolean canManageDepartmentGoals(Long departmentId) {
        return isDepartmentManager(departmentId) || isManagerAssistant(departmentId);
    }

    /**
     * Get the current user's email.
     * @return the email of the current user, or null if not authenticated
     */
    public String getCurrentUserEmail() {
        User currentUser = UserContext.getCurrentUser();
        return currentUser != null ? currentUser.getEmail() : null;
    }
}


