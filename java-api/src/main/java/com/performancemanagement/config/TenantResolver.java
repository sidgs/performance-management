package com.performancemanagement.config;

import com.performancemanagement.model.Tenant;
import com.performancemanagement.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Component
public class TenantResolver {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Extracts tenant subdomain from the HTTP request.
     * Supports formats like:
     * - tenant1.example.com -> tenant1
     * - tenant1.localhost:8080 -> tenant1
     * - localhost:8080 -> null (default tenant or error)
     */
    public Optional<Tenant> resolveTenant(HttpServletRequest request) {
        String host = request.getHeader("Host");
        if (!StringUtils.hasText(host)) {
            return Optional.empty();
        }

        // Remove port if present
        String hostWithoutPort = host.split(":")[0];

        // Extract subdomain (everything before the first dot)
        String[] parts = hostWithoutPort.split("\\.");
        
        // If we have at least 2 parts (subdomain.domain), extract subdomain
        // If only 1 part (localhost), return empty
        if (parts.length >= 2) {
            String subdomain = parts[0];
            return tenantRepository.findBySubdomain(subdomain);
        }

        // For localhost or IP addresses, check for X-Tenant-Id header as fallback
        String tenantIdHeader = request.getHeader("X-Tenant-Id");
        if (StringUtils.hasText(tenantIdHeader)) {
            try {
                Long tenantId = Long.parseLong(tenantIdHeader);
                return tenantRepository.findById(tenantId);
            } catch (NumberFormatException e) {
                // Invalid tenant ID format
                return Optional.empty();
            }
        }

        // Check for X-Tenant-Subdomain header as another fallback
        String tenantSubdomainHeader = request.getHeader("X-Tenant-Subdomain");
        if (StringUtils.hasText(tenantSubdomainHeader)) {
            return tenantRepository.findBySubdomain(tenantSubdomainHeader);
        }

        return Optional.empty();
    }
}
