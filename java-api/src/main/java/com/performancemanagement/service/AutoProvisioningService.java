package com.performancemanagement.service;

import com.performancemanagement.config.JwtTokenProvider.JwtUserDetails;
import com.performancemanagement.model.Tenant;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.TenantRepository;
import com.performancemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for auto-provisioning tenants and users from JWT tokens.
 * 
 * When auto.provision.tenant=true and auto.provision.user=true, this service
 * will automatically create tenants and users from valid JWT tokens if they don't exist.
 */
@Service
public class AutoProvisioningService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${auto.provision.tenant:false}")
    private boolean autoProvisionTenant;

    @Value("${auto.provision.user:false}")
    private boolean autoProvisionUser;

    /**
     * Auto-provision tenant from JWT token if it doesn't exist and auto-provisioning is enabled.
     * 
     * @param jwtDetails The JWT user details containing tenant_id
     * @return The tenant (existing or newly created), or null if auto-provisioning is disabled
     */
    @Transactional
    public Tenant provisionTenantIfNeeded(JwtUserDetails jwtDetails) {
        if (!autoProvisionTenant || jwtDetails == null || jwtDetails.getTenantId() == null) {
            return null;
        }

        String tenantId = jwtDetails.getTenantId().trim().toLowerCase();
        
        // Check if tenant already exists
        return tenantRepository.findByFqdn(tenantId)
                .orElseGet(() -> {
                    // Create new tenant
                    Tenant newTenant = new Tenant();
                    newTenant.setFqdn(tenantId);
                    newTenant.setName(tenantId); // Use FQDN as name by default
                    newTenant.setActive(true);
                    return tenantRepository.save(newTenant);
                });
    }

    /**
     * Auto-provision user from JWT token if it doesn't exist and auto-provisioning is enabled.
     * 
     * @param jwtDetails The JWT user details
     * @param tenant The tenant to associate the user with (must not be null)
     * @return The user (existing or newly created), or null if auto-provisioning is disabled
     */
    @Transactional
    public User provisionUserIfNeeded(JwtUserDetails jwtDetails, Tenant tenant) {
        if (!autoProvisionUser || jwtDetails == null || tenant == null || jwtDetails.getEmail() == null) {
            return null;
        }

        String email = jwtDetails.getEmail().trim().toLowerCase();
        String tenantId = tenant.getFqdn();

        // Check if user already exists
        return userRepository.findByEmailAndTenantId(email, tenantId)
                .orElseGet(() -> {
                    // Create new user
                    User newUser = new User();
                    newUser.setTenant(tenant);
                    newUser.setEmail(email);
                    
                    // Handle name: if username is provided, try to split it; otherwise use email prefix
                    String username = jwtDetails.getUsername();
                    if (username != null && !username.trim().isEmpty()) {
                        newUser.setFullName(username);
                    } else {
                        // Fallback: use email prefix as first name
                        String emailPrefix = email.split("@")[0];
                        newUser.setFirstName(emailPrefix);
                        newUser.setLastName("");
                    }
                    
                    // Set role from JWT if present
                    List<String> roles = jwtDetails.getRoles();
                    if (roles != null && roles.contains("EPM_ADMIN")) {
                        newUser.setRole(User.Role.EPM_ADMIN);
                    } else {
                        newUser.setRole(User.Role.USER);
                    }
                    
                    return userRepository.save(newUser);
                });
    }
}

