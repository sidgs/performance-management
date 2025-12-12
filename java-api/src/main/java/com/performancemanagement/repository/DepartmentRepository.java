package com.performancemanagement.repository;

import com.performancemanagement.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    @Query("SELECT d FROM Department d WHERE d.parentDepartment.id = :parentDepartmentId AND d.tenant.id = :tenantId")
    List<Department> findByParentDepartmentIdAndTenantId(@Param("parentDepartmentId") Long parentDepartmentId, @Param("tenantId") Long tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.parentDepartment IS NULL AND d.tenant.id = :tenantId")
    List<Department> findByParentDepartmentIsNullAndTenantId(@Param("tenantId") Long tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.owner.email = :email AND d.tenant.id = :tenantId")
    List<Department> findByOwnerEmailAndTenantId(@Param("email") String email, @Param("tenantId") Long tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.id = :id AND d.tenant.id = :tenantId")
    java.util.Optional<Department> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.tenant.id = :tenantId")
    List<Department> findAllByTenantId(@Param("tenantId") Long tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    List<Department> findByParentDepartmentId(Long parentDepartmentId);
    List<Department> findByParentDepartmentIsNull();
    List<Department> findByOwnerEmail(String email);
}
