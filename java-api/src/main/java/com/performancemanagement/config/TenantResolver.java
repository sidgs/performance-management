package com.performancemanagement.config;

import com.performancemanagement.model.Tenant;
import com.performancemanagement.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

@Component
public class TenantResolver {

    @Autowired
    private TenantRepository tenantRepository;

    public Optional<Tenant> resolveTenant(HttpServletRequest request) {
        // First, try to resolve using the FQDN from HTTP headers.
        String fqdn = extractFqdnFromRequest(request);
        if (StringUtils.hasText(fqdn)) {
            // Normalize to lower-case for consistent lookups
            String normalizedFqdn = fqdn.toLowerCase();
            Optional<Tenant> tenantByFqdn = tenantRepository.findByFqdnAndActiveTrue(normalizedFqdn);
            if (tenantByFqdn.isPresent()) {
                return tenantByFqdn;
            }
        }

        // Fallback: For localhost or when FQDN mapping is not available,
        // allow explicit tenant override headers (useful for local/dev).
        // X-Tenant-Id now accepts FQDN directly (e.g., "localhost" or "acme.example.com")
        String tenantIdHeader = request.getHeader("X-Tenant-Id");
        if (StringUtils.hasText(tenantIdHeader)) {
            return tenantRepository.findByFqdn(tenantIdHeader.trim().toLowerCase());
        }

        return Optional.empty();
    }

    /**
     * Extracts the tenant identifier as an FQDN from the request.
     *
     * Priority:
     * 1. Host header
     * 2. X-Forwarded-Host header
     * 3. Origin header
     * 4. Forwarded header (host=)
     *
     * For each, any port present is stripped so only the FQDN remains.
     */
    private String extractFqdnFromRequest(HttpServletRequest request) {
        // 1) Standard Host header
        String host = request.getHeader("Host");
        if (StringUtils.hasText(host)) {
            return stripPort(host);
        }

        // 2) Common proxy header
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        if (StringUtils.hasText(forwardedHost)) {
            // Can be a comma-separated list; use the first value
            String firstHost = forwardedHost.split(",")[0].trim();
            if (StringUtils.hasText(firstHost)) {
                return stripPort(firstHost);
            }
        }

        // 3) Origin header (e.g. https://tenant.example.com:8443)
        String origin = request.getHeader("Origin");
        if (StringUtils.hasText(origin)) {
            try {
                URI originUri = new URI(origin);
                if (StringUtils.hasText(originUri.getHost())) {
                    return originUri.getHost().toLowerCase();
                }
            } catch (URISyntaxException ignored) {
                // If Origin is malformed, fall through to the next option
            }
        }

        // 4) RFC 7239 Forwarded header, e.g.: Forwarded: proto=https;host=tenant.example.com:443
        String forwarded = request.getHeader("Forwarded");
        if (StringUtils.hasText(forwarded)) {
            String[] parts = forwarded.split(";");
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.toLowerCase().startsWith("host=")) {
                    String hostValue = trimmed.substring(5).trim();
                    // Remove surrounding quotes if present
                    if (hostValue.startsWith("\"") && hostValue.endsWith("\"") && hostValue.length() > 1) {
                        hostValue = hostValue.substring(1, hostValue.length() - 1);
                    }
                    if (StringUtils.hasText(hostValue)) {
                        return stripPort(hostValue);
                    }
                }
            }
        }

        return null;
    }

    /**
     * Strips the port from a hostname string if one is present.
     * Examples:
     * - "tenant.example.com:8080" -> "tenant.example.com"
     * - "tenant.example.com" -> "tenant.example.com"
     */
    private String stripPort(String hostHeaderValue) {
        if (!StringUtils.hasText(hostHeaderValue)) {
            return null;
        }

        String value = hostHeaderValue.trim();
        // We assume FQDNs here (not raw IPv6 literals with brackets), so a simple split is acceptable.
        int colonIndex = value.indexOf(':');
        if (colonIndex > -1) {
            return value.substring(0, colonIndex).toLowerCase();
        }

        return value.toLowerCase();
    }
}
