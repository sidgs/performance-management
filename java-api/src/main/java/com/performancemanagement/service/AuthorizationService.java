package com.performancemanagement.service;

import com.performancemanagement.config.UserContext;
import com.performancemanagement.model.User;
import org.springframework.stereotype.Service;

/**
 * Simple role-based authorization checks for the application.
 *
 * Currently, authorization is based on the per-request {@link UserContext},
 * which is populated by {@link com.performancemanagement.config.JwtAuthenticationFilter} based on the JWT token or X-User-Email header.
 */
@Service
public class AuthorizationService {

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
}


