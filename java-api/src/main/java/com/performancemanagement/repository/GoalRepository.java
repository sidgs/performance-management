package com.performancemanagement.repository;

import com.performancemanagement.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByOwnerEmail(String email);
    List<Goal> findByParentGoalId(Long parentGoalId);
    List<Goal> findByParentGoalIsNull();
}
