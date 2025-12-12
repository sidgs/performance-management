package com.performancemanagement.repository;

import com.performancemanagement.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    @Query("SELECT g FROM Goal g WHERE g.owner.email = :email AND g.tenant.id = :tenantId")
    List<Goal> findByOwnerEmailAndTenantId(@Param("email") String email, @Param("tenantId") Long tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.parentGoal.id = :parentGoalId AND g.tenant.id = :tenantId")
    List<Goal> findByParentGoalIdAndTenantId(@Param("parentGoalId") Long parentGoalId, @Param("tenantId") Long tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.parentGoal IS NULL AND g.tenant.id = :tenantId")
    List<Goal> findByParentGoalIsNullAndTenantId(@Param("tenantId") Long tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.id = :id AND g.tenant.id = :tenantId")
    java.util.Optional<Goal> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);
    
    @Query("SELECT g FROM Goal g WHERE g.tenant.id = :tenantId")
    List<Goal> findAllByTenantId(@Param("tenantId") Long tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    List<Goal> findByOwnerEmail(String email);
    List<Goal> findByParentGoalId(Long parentGoalId);
    List<Goal> findByParentGoalIsNull();
}
