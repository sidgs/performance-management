package com.performancemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtRequest {

    /**
     * Human-readable name for the user (OIDC "name" claim).
     */
    private String name;

    /**
     * User email address (OIDC "email" claim and used as subject if present).
     */
    private String email;

    /**
     * Optional tenant identifier used for the "tenant_id" claim.
     * If not provided, the current tenant's ID will be used (as a string) when available.
     * Example: "localhost"
     */
    private String tenantId;

    /**
     * Logical roles assigned to the user, e.g. ["user", "admin"].
     */
    private List<String> roles;

    /**
     * Fine-grained permissions, if any, e.g. ["departments:write", "users:read"].
     */
    private List<String> permissions;
}


