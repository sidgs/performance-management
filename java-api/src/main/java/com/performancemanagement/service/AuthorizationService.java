package com.performancemanagement.service;

import com.performancemanagement.config.UserContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
     * Get the current user's email.
     * @return the email of the current user, or null if not authenticated
     */
    public String getCurrentUserEmail() {
        User currentUser = UserContext.getCurrentUser();
        return currentUser != null ? currentUser.getEmail() : null;
    }

    /**
     * Check if the current user is a manager (owner or co-owner) of the specified department.
     * @param departmentId The department ID to check
     * @return true if the user is the owner or co-owner of the department
     */
    public boolean isDepartmentManager(Long departmentId) {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        String tenantId = currentUser.getTenant() != null ? currentUser.getTenant().getFqdn() : null;
        if (tenantId == null) {
            return false;
        }
        
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElse(null);
        
        if (department == null) {
            return false;
        }
        
        String userEmail = currentUser.getEmail();
        return (department.getOwner() != null && userEmail.equals(department.getOwner().getEmail())) ||
               (department.getCoOwner() != null && userEmail.equals(department.getCoOwner().getEmail()));
    }

    /**
     * Ensure the current user is a manager (owner or co-owner) of the specified department.
     * Throws an {@link IllegalStateException} if the user is not a manager.
     */
    public void requireDepartmentManager(Long departmentId) {
        if (!isDepartmentManager(departmentId)) {
            throw new IllegalStateException("Department manager (owner or co-owner) access required for this operation.");
        }
    }

    /**
     * Check if the current user is a manager (owner or co-owner) of any department.
     * @return true if the user manages at least one department
     */
    public boolean isAnyDepartmentManager() {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        String tenantId = currentUser.getTenant() != null ? currentUser.getTenant().getFqdn() : null;
        if (tenantId == null) {
            return false;
        }
        
        List<Department> departments = departmentRepository.findByManagerEmailAndTenantId(
                currentUser.getEmail(), tenantId);
        return departments != null && !departments.isEmpty();
    }
}


