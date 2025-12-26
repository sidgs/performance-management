package com.performancemanagement.repository;

import com.performancemanagement.model.KPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KPIRepository extends JpaRepository<KPI, Long> {
    
    @Query("SELECT k FROM KPI k JOIN k.goal g WHERE g.id = :goalId AND g.tenant.fqdn = :tenantId")
    List<KPI> findByGoalIdAndTenantId(@Param("goalId") Long goalId, @Param("tenantId") String tenantId);
    
    @Query("SELECT k FROM KPI k WHERE k.id = :id AND k.goal.tenant.fqdn = :tenantId")
    Optional<KPI> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
}


