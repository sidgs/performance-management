package com.performancemanagement.repository;

import com.performancemanagement.model.GoalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalNoteRepository extends JpaRepository<GoalNote, Long> {
    
    @Query("SELECT n FROM GoalNote n JOIN n.goal g WHERE g.id = :goalId AND g.tenant.fqdn = :tenantId ORDER BY n.createdAt DESC")
    List<GoalNote> findByGoalIdAndTenantId(@Param("goalId") Long goalId, @Param("tenantId") String tenantId);
    
    @Query("SELECT n FROM GoalNote n WHERE n.id = :id AND n.goal.tenant.fqdn = :tenantId")
    Optional<GoalNote> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
}
