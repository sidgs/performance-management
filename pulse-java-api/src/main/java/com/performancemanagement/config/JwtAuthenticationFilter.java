package com.performancemanagement.config;

import com.performancemanagement.config.JwtTokenProvider.JwtUserDetails;
import com.performancemanagement.model.Tenant;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.TenantRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.AutoProvisioningService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final TenantResolver tenantResolver;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AutoProvisioningService autoProvisioningService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                  TenantResolver tenantResolver,
                                  TenantRepository tenantRepository,
                                  UserRepository userRepository,
                                  AutoProvisioningService autoProvisioningService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.tenantResolver = tenantResolver;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.autoProvisioningService = autoProvisioningService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Skip JWT authentication for public endpoints: JWT minting, health checks, and actuator
        if (path.contains("/jwt") || path.contains("/actuator") || path.endsWith("/health") || path.endsWith("/health/")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            JwtUserDetails jwtDetails = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                logger.debug("Attempting to parse JWT token for request: {}", path);
                jwtDetails = jwtTokenProvider.parseToken(token);

                if (jwtDetails != null) {
                    logger.debug("Successfully parsed JWT token for user: {}", jwtDetails.getEmail());
                    // Set Spring Security authentication FIRST - this ensures the user is authenticated
                    // even if tenant/user provisioning fails
                    // All logged-in users have the USER role in addition to whatever roles are in the JWT
                    List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                    // Always add USER role
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    // Add additional roles from JWT if present
                    if (jwtDetails.getRoles() != null && !jwtDetails.getRoles().isEmpty()) {
                        jwtDetails.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .forEach(authorities::add);
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(jwtDetails, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Resolve or create tenant from JWT (priority) or headers (fallback)
                    // Note: Tenant/user provisioning failures should not prevent authentication
                    try {
                        Optional<Tenant> tenant = Optional.empty();
                        
                        // First, try to get or create tenant from JWT if tenantId is present
                        if (jwtDetails.getTenantId() != null) {
                            try {
                                Tenant provisionedTenant = autoProvisioningService.provisionTenantIfNeeded(jwtDetails);
                                if (provisionedTenant != null) {
                                    tenant = Optional.of(provisionedTenant);
                                } else {
                                    // If auto-provisioning is disabled, try to find existing tenant
                                    String tenantId = jwtDetails.getTenantId().trim().toLowerCase();
                                    tenant = tenantRepository.findByFqdn(tenantId);
                                }
                            } catch (Exception e) {
                                // Log but don't fail - try to find existing tenant
                                logger.warn("Error provisioning tenant, trying to find existing: " + e.getMessage());
                                String tenantId = jwtDetails.getTenantId().trim().toLowerCase();
                                tenant = tenantRepository.findByFqdn(tenantId);
                            }
                        }
                        
                        // Fallback: If no tenant from JWT, try header-based resolution
                        if (tenant.isEmpty()) {
                            tenant = tenantResolver.resolveTenant(request);
                        }

                        // Set Tenant Context if tenant is present and active
                        if (tenant.isPresent() && Boolean.TRUE.equals(tenant.get().getActive())) {
                            TenantContext.setCurrentTenant(tenant.get());
                            Tenant resolvedTenant = tenant.get();

                            // Resolve or create user
                            try {
                                User currentUser = null;
                                
                                // First, try X-User-Email header
                                String userEmail = request.getHeader("X-User-Email");
                                if (userEmail != null && !userEmail.isBlank()) {
                                    String tenantId = TenantContext.getCurrentTenantId();
                                    Optional<User> userOpt = userRepository.findByEmailAndTenantId(userEmail, tenantId);
                                    if (userOpt.isPresent()) {
                                        currentUser = userOpt.get();
                                    }
                                }
                                
                                // If no user found and we have valid JWT, try auto-provisioning or find existing
                                if (currentUser == null && jwtDetails.getEmail() != null) {
                                    try {
                                        // Try to auto-provision user from JWT
                                        User provisionedUser = autoProvisioningService.provisionUserIfNeeded(jwtDetails, resolvedTenant);
                                        if (provisionedUser != null) {
                                            currentUser = provisionedUser;
                                        } else {
                                            // Try to find existing user by email from JWT
                                            String tenantId = TenantContext.getCurrentTenantId();
                                            Optional<User> userOpt = userRepository.findByEmailAndTenantId(jwtDetails.getEmail(), tenantId);
                                            if (userOpt.isPresent()) {
                                                currentUser = userOpt.get();
                                            }
                                        }
                                    } catch (Exception e) {
                                        // Log but don't fail - try to find existing user
                                        logger.warn("Error provisioning user, trying to find existing: " + e.getMessage());
                                        String tenantId = TenantContext.getCurrentTenantId();
                                        Optional<User> userOpt = userRepository.findByEmailAndTenantId(jwtDetails.getEmail(), tenantId);
                                        if (userOpt.isPresent()) {
                                            currentUser = userOpt.get();
                                        }
                                    }
                                }
                                
                                // Set User Context if user is found
                                if (currentUser != null) {
                                    UserContext.setCurrentUser(currentUser);
                                }
                            } catch (Exception e) {
                                // Log but don't fail authentication
                                logger.warn("Error setting user context: " + e.getMessage());
                            }
                        }
                    } catch (Exception e) {
                        // Log but don't fail authentication - user is still authenticated via JWT
                        logger.warn("Error during tenant/user provisioning: " + e.getMessage());
                    }
                } else {
                    // Invalid JWT token - set authentication as null to trigger 401 from Spring Security
                    // or return 401 directly
                    logger.debug("JWT token received (for debugging): {}", token);
                    logger.warn("Invalid or expired JWT token for request: {} - token parsing returned null", path);
                    try {
                        if (!response.isCommitted()) {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\":\"Invalid or expired JWT token\"}");
                            response.getWriter().flush();
                        }
                    } catch (IOException e) {
                        logger.error("Error writing error response", e);
                    }
                    return;
                }
            } else {
                // No Authorization header - return 401 Unauthorized
                logger.debug("No Authorization header for request: {}", path);
                try {
                    if (!response.isCommitted()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");
                        response.getWriter().write("{\"error\":\"Authentication required. Please provide a valid JWT token.\"}");
                        response.getWriter().flush();
                    }
                } catch (IOException e) {
                    logger.error("Error writing error response", e);
                }
                return;
            }

            filterChain.doFilter(request, response);
        } finally {
            // Always clear tenant and user context after request
            UserContext.clear();
            TenantContext.clear();
        }
    }
}


