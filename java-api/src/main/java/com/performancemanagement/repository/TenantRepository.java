package com.performancemanagement.repository;

import com.performancemanagement.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySubdomain(String subdomain);
    Optional<Tenant> findBySubdomainAndActiveTrue(String subdomain);
}
