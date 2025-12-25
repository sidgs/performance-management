package com.performancemanagement.repository;

import com.performancemanagement.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    @Query("SELECT g FROM Goal g WHERE g.owner.email = :email AND g.tenant.fqdn = :tenantId")
    List<Goal> findByOwnerEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.parentGoal.id = :parentGoalId AND g.tenant.fqdn = :tenantId")
    List<Goal> findByParentGoalIdAndTenantId(@Param("parentGoalId") Long parentGoalId, @Param("tenantId") String tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.parentGoal IS NULL AND g.tenant.fqdn = :tenantId")
    List<Goal> findByParentGoalIsNullAndTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.id = :id AND g.tenant.fqdn = :tenantId")
    java.util.Optional<Goal> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.tenant.fqdn = :tenantId")
    List<Goal> findAllByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT DISTINCT g FROM Goal g JOIN g.assignedUsers u WHERE u.department.id = :departmentId AND g.tenant.fqdn = :tenantId")
    List<Goal> findByDepartmentIdAndTenantId(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);
    
    @Query("SELECT g FROM Goal g JOIN g.assignedUsers u WHERE u.email = :userEmail AND g.tenant.fqdn = :tenantId")
    List<Goal> findByAssignedUserEmailAndTenantId(@Param("userEmail") String userEmail, @Param("tenantId") String tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    List<Goal> findByOwnerEmail(String email);
    List<Goal> findByParentGoalId(Long parentGoalId);
    List<Goal> findByParentGoalIsNull();
}
