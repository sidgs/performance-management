package com.performancemanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.JwtRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JwtService {

    @Autowired
    private ObjectMapper objectMapper;

    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    /**
     * Build an unsigned (alg=none) OIDC-compatible JWT string.
     * The resulting token has the form header.payload. (trailing dot, no signature).
     */
    public String createUnsignedToken(JwtRequest request) {
        try {
            String headerJson = objectMapper.writeValueAsString(buildHeader());
            String payloadJson = objectMapper.writeValueAsString(buildPayload(request));

            String header = BASE64_URL_ENCODER.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String payload = BASE64_URL_ENCODER.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            // Unsigned JWT uses alg "none" and an empty signature part.
            return header + "." + payload + ".";
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize JWT", e);
        }
    }

    private Map<String, Object> buildHeader() {
        Map<String, Object> header = new HashMap<>();
        header.put("alg", "none");
        header.put("typ", "JWT");
        return header;
    }

    private Map<String, Object> buildPayload(JwtRequest request) {
        Map<String, Object> claims = new HashMap<>();

        // Standard OIDC/JWT-style claims aligned with the provided example
        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = issuedAt + 3600; // 1 hour validity by default

        claims.put("iss", "sami-x-portal");
        claims.put("aud", "sami-x-api");
        claims.put("iat", issuedAt);
        claims.put("exp", expiresAt);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            claims.put("sub", request.getEmail());
            claims.put("email", request.getEmail());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            claims.put("name", request.getName());
        }

        // Tenant (snake_case as per example)
        String tenantId = request.getTenantId();
        if (tenantId == null) {
            tenantId = TenantContext.getCurrentTenantId();
        }
        if (tenantId != null) {
            claims.put("tenant_id", tenantId);
        }

        // Roles and permissions as simple arrays
        List<String> roles = request.getRoles();
        if (roles != null && !roles.isEmpty()) {
            claims.put("roles", roles);
        }

        List<String> permissions = request.getPermissions();
        if (permissions != null && !permissions.isEmpty()) {
            claims.put("permissions", permissions);
        }

        return claims;
    }
}


