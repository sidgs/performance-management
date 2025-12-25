package com.performancemanagement.config;

import com.performancemanagement.model.Tenant;

public class TenantContext {
    private static final ThreadLocal<Tenant> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(Tenant tenant) {
        currentTenant.set(tenant);
    }

    public static Tenant getCurrentTenant() {
        return currentTenant.get();
    }

    public static String getCurrentTenantId() {
        Tenant tenant = currentTenant.get();
        return tenant != null ? tenant.getFqdn() : null;
    }

    public static void clear() {
        currentTenant.remove();
    }
}
