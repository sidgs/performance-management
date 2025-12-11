package com.performancemanagement.repository;

import com.performancemanagement.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByParentDepartmentId(Long parentDepartmentId);
    List<Department> findByParentDepartmentIsNull();
    List<Department> findByOwnerEmail(String email);
}
