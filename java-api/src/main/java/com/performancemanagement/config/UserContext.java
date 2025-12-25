package com.performancemanagement.config;

import com.performancemanagement.model.User;

/**
 * Simple per-request holder for the current authenticated user, if any.
 * This is populated by {@link JwtAuthenticationFilter} based on the JWT token or X-User-Email header.
 */
public class UserContext {

    private static final ThreadLocal<User> currentUser = new ThreadLocal<>();

    public static void setCurrentUser(User user) {
        currentUser.set(user);
    }

    public static User getCurrentUser() {
        return currentUser.get();
    }

    public static void clear() {
        currentUser.remove();
    }
}


