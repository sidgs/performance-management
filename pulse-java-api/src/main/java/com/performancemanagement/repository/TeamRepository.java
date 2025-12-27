package com.performancemanagement.repository;

import com.performancemanagement.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    @Query("SELECT t FROM Team t WHERE t.department.id = :departmentId AND t.tenant.fqdn = :tenantId")
    List<Team> findByDepartmentIdAndTenantId(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Team t WHERE t.teamLead.id = :teamLeadId AND t.tenant.fqdn = :tenantId")
    List<Team> findByTeamLeadIdAndTenantId(@Param("teamLeadId") Long teamLeadId, @Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Team t WHERE t.tenant.fqdn = :tenantId")
    List<Team> findByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Team t WHERE t.id = :id AND t.tenant.fqdn = :tenantId")
    Optional<Team> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
    
    @Query("SELECT t FROM Team t WHERE t.name = :name AND t.department.id = :departmentId AND t.tenant.fqdn = :tenantId")
    Optional<Team> findByNameAndDepartmentIdAndTenantId(
        @Param("name") String name, 
        @Param("departmentId") Long departmentId, 
        @Param("tenantId") String tenantId
    );
}

