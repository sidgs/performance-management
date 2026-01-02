package com.performancemanagement.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.Map;

/**
 * Utility for parsing and validating JWT tokens.
 *
 * Token requirements:
 * - Must contain: username, email, roles, permissions, tenantId
 * - Must contain an expiration (exp) claim
 * - In local, dev, or demo profiles, unsigned tokens are allowed as long as they are not expired.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey secretKey;
    private final Environment environment;
    private final String jwtAllowUnsignedProperty;

    public JwtTokenProvider(
            @Value("${security.jwt.secret:change-me-secret}") String secret,
            @Value("${security.jwt.allow-unsigned:}") String jwtAllowUnsigned,
            Environment environment
    ) {
        this.environment = environment;
        this.jwtAllowUnsignedProperty = jwtAllowUnsigned;

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // JJWT requires >= 256-bit keys for HMAC-SHA algorithms.
        // If the configured secret is too short (e.g. default "change-me-secret"),
        // fall back to generating a secure random key for HS256 to avoid startup failure.
        if (keyBytes.length < 32) {
            this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        }
    }

    public JwtUserDetails parseToken(String token) {
        Claims claims = null;

        boolean isUnsignedAllowed = isUnsignedAllowed();

        try {
            if (isUnsignedAllowed) {
                // When unsigned tokens are allowed, try to parse without signature verification
                // First try as unsigned token (alg=none)
                try {
                    claims = Jwts.parserBuilder()
                            .build()
                            .parseClaimsJwt(token)
                            .getBody();
                } catch (Exception unsignedEx) {
                    // If that fails, it might be a signed token - parse without signature verification
                    logger.debug("JWT parsing as unsigned failed, attempting to parse without signature verification: {}", unsignedEx.getMessage());
                    claims = parseClaimsWithoutVerification(token);
                }
            } else {
                // Standard signed JWT parsing with signature verification
                Jws<Claims> jwsClaims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token);
                claims = jwsClaims.getBody();
            }
        } catch (Exception ex) {
            logger.debug("JWT parsing failed: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
            // If parsing failed and unsigned is allowed, try parsing without verification
            if (isUnsignedAllowed) {
                try {
                    claims = parseClaimsWithoutVerification(token);
                    logger.debug("JWT parsing succeeded without signature verification");
                } catch (Exception unverifiedEx) {
                    logger.debug("JWT parsing failed (unverified attempt): {} - {}", unverifiedEx.getClass().getSimpleName(), unverifiedEx.getMessage());
                    return null;
                }
            } else {
                return null;
            }
        }

        if (claims == null) {
            return null;
        }

        // Enforce expiration regardless of signature
        Date expiration = claims.getExpiration();
        if (expiration == null) {
            // No expiration claim - reject token
            logger.debug("JWT token rejected: missing expiration (exp) claim");
            return null;
        }
        if (expiration.toInstant().isBefore(Instant.now())) {
            // Token has expired
            logger.debug("JWT token rejected: token expired at {}, current time is {}", expiration, Instant.now());
            return null;
        }

        // Try both "username" and "name" for username (OIDC uses "name")
        String username = claims.get("username", String.class);
        if (username == null) {
            username = claims.get("name", String.class);
        }
        
        String email = claims.get("email", String.class);
        
        // Try both "tenantId" (camelCase) and "tenant_id" (snake_case)
        String tenantId = claims.get("tenantId", String.class);
        if (tenantId == null) {
            tenantId = claims.get("tenant_id", String.class);
        }
        // Convert to string if it was stored as a number
        if (tenantId == null) {
            Object tenantIdObj = claims.get("tenantId");
            if (tenantIdObj != null) {
                tenantId = String.valueOf(tenantIdObj);
            } else {
                tenantIdObj = claims.get("tenant_id");
                if (tenantIdObj != null) {
                    tenantId = String.valueOf(tenantIdObj);
                }
            }
        }

        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);
        @SuppressWarnings("unchecked")
        List<String> permissions = claims.get("permissions", List.class);

        // Email and tenantId are required; username can be derived from email if missing
        if (email == null || tenantId == null) {
            logger.debug("JWT token rejected: missing required claims - email: {}, tenantId: {}", email != null, tenantId != null);
            return null;
        }
        
        // If username is still null, use email prefix as fallback
        if (username == null || username.trim().isEmpty()) {
            username = email.split("@")[0];
        }

        return new JwtUserDetails(username, email, tenantId, roles, permissions);
    }

    /**
     * Parse JWT claims without signature verification.
     * This is used when isUnsignedAllowed is true to accept tokens with mismatched signatures.
     */
    private Claims parseClaimsWithoutVerification(String token) {
        try {
            // Split the JWT into parts: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            
            // Decode the payload (second part)
            String payload = parts[1];
            // Add padding if needed for Base64 decoding
            StringBuilder payloadBuilder = new StringBuilder(payload);
            while (payloadBuilder.length() % 4 != 0) {
                payloadBuilder.append("=");
            }
            payload = payloadBuilder.toString();
            
            byte[] decodedBytes = Base64.getUrlDecoder().decode(payload);
            String jsonPayload = new String(decodedBytes, StandardCharsets.UTF_8);
            
            // Parse JSON and create Claims object
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> claimsMap = mapper.readValue(jsonPayload, Map.class);
            
            // Convert expiration timestamp to Date if present
            if (claimsMap.containsKey("exp")) {
                Object expObj = claimsMap.get("exp");
                if (expObj instanceof Number expNumber) {
                    long expSeconds = expNumber.longValue();
                    claimsMap.put("exp", new Date(expSeconds * 1000));
                }
            }
            
            // Convert issued at timestamp to Date if present
            if (claimsMap.containsKey("iat")) {
                Object iatObj = claimsMap.get("iat");
                if (iatObj instanceof Number iatNumber) {
                    long iatSeconds = iatNumber.longValue();
                    claimsMap.put("iat", new Date(iatSeconds * 1000));
                }
            }
            
            // Create Claims object from the map
            return Jwts.claims(claimsMap);
        } catch (IllegalArgumentException | JsonProcessingException e) {
            logger.debug("Failed to parse JWT claims without verification: {}", e.getMessage());
            throw new RuntimeException("Failed to parse JWT without verification", e);
        }
    }

    private boolean isUnsignedAllowed() {
        // First check JWT_ALLOW_UNSIGNED environment variable (takes precedence)
        String envVar = System.getenv("JWT_ALLOW_UNSIGNED");
        if (envVar != null && !envVar.trim().isEmpty()) {
            return "true".equalsIgnoreCase(envVar.trim());
        }
        
        // Then check security.jwt.allow-unsigned property
        if (jwtAllowUnsignedProperty != null && !jwtAllowUnsignedProperty.trim().isEmpty()) {
            return "true".equalsIgnoreCase(jwtAllowUnsignedProperty.trim());
        }
        
        // Fall back to profile-based check (dev/local/demo)
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("local") || p.equalsIgnoreCase("demo"));
    }

    /**
     * Simple DTO representing the authenticated user as extracted from the JWT.
     */
    public static class JwtUserDetails {
        private final String username;
        private final String email;
        private final String tenantId;
        private final List<String> roles;
        private final List<String> permissions;

        public JwtUserDetails(String username, String email, String tenantId,
                              List<String> roles, List<String> permissions) {
            this.username = username;
            this.email = email;
            this.tenantId = tenantId;
            this.roles = roles;
            this.permissions = permissions;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }

        public String getTenantId() {
            return tenantId;
        }

        public List<String> getRoles() {
            return roles;
        }

        public List<String> getPermissions() {
            return permissions;
        }
    }
}


