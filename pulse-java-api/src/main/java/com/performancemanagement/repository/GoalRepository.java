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
    
    @Query("SELECT DISTINCT g FROM Goal g " +
           "LEFT JOIN g.assignedUsers au " +
           "WHERE g.tenant.fqdn = :tenantId " +
           "AND (" +
           "  g.owner.id = :userId " +
           "  OR au.id = :userId " +
           "  OR (g.owner.department IS NOT NULL AND g.owner.department.id = :departmentId) " +
           "  OR (au.department IS NOT NULL AND au.department.id = :departmentId)" +
           ")")
    List<Goal> findGoalsForUserAndDepartment(@Param("tenantId") String tenantId, 
                                              @Param("userId") Long userId, 
                                              @Param("departmentId") Long departmentId);
    
    @Query("SELECT DISTINCT g FROM Goal g " +
           "LEFT JOIN g.assignedUsers au " +
           "WHERE g.tenant.fqdn = :tenantId " +
           "AND (g.owner.id = :userId OR au.id = :userId)")
    List<Goal> findGoalsForUser(@Param("tenantId") String tenantId, @Param("userId") Long userId);
    
    @Query("SELECT g FROM Goal g WHERE g.territory = :territory AND g.tenant.fqdn = :tenantId")
    List<Goal> findByTerritoryAndTenantId(@Param("territory") com.performancemanagement.model.Territory territory, @Param("tenantId") String tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    List<Goal> findByOwnerEmail(String email);
    List<Goal> findByParentGoalId(Long parentGoalId);
    List<Goal> findByParentGoalIsNull();
}
