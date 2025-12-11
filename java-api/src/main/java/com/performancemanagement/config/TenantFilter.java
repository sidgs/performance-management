package com.performancemanagement.config;

import com.performancemanagement.model.Tenant;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    private TenantResolver tenantResolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Skip tenant filtering for health checks and actuator endpoints
        // Note: context path is /api/v1/performance-management, so we check the full path
        if (path.contains("/actuator") || path.endsWith("/health") || path.endsWith("/health/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            Optional<Tenant> tenant = tenantResolver.resolveTenant(request);
            
            if (tenant.isPresent() && tenant.get().getActive()) {
                TenantContext.setCurrentTenant(tenant.get());
                filterChain.doFilter(request, response);
            } else {
                // Tenant not found or inactive
                response.setStatus(HttpStatus.BAD_REQUEST.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or inactive tenant. Please ensure the request includes a valid tenant subdomain or X-Tenant-Id/X-Tenant-Subdomain header.\"}");
                return;
            }
        } finally {
            // Always clear tenant context after request
            TenantContext.clear();
        }
    }
}
