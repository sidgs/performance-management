package com.performancemanagement.repository;

import com.performancemanagement.model.Territory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TerritoryRepository extends JpaRepository<Territory, Long> {
    @Query("SELECT t FROM Territory t WHERE t.tenant.fqdn = :tenantId")
    List<Territory> findByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Territory t WHERE t.name = :name AND t.tenant.fqdn = :tenantId")
    Optional<Territory> findByNameAndTenantId(@Param("name") String name, @Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Territory t WHERE t.id = :id AND t.tenant.fqdn = :tenantId")
    Optional<Territory> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
}

