package com.performancemanagement.repository;

import com.performancemanagement.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    @Query("SELECT d FROM Department d WHERE d.parentDepartment.id = :parentDepartmentId AND d.tenant.fqdn = :tenantId")
    List<Department> findByParentDepartmentIdAndTenantId(@Param("parentDepartmentId") Long parentDepartmentId, @Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.parentDepartment IS NULL AND d.tenant.fqdn = :tenantId")
    List<Department> findByParentDepartmentIsNullAndTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.owner.email = :email AND d.tenant.fqdn = :tenantId")
    List<Department> findByOwnerEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.id = :id AND d.tenant.fqdn = :tenantId")
    java.util.Optional<Department> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.tenant.fqdn = :tenantId")
    List<Department> findAllByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE d.name = :name AND d.tenant.fqdn = :tenantId")
    Optional<Department> findByNameAndTenantId(@Param("name") String name, @Param("tenantId") String tenantId);
    
    @Query("SELECT d FROM Department d WHERE (d.owner.email = :email OR d.coOwner.email = :email) AND d.tenant.fqdn = :tenantId")
    List<Department> findByManagerEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    List<Department> findByParentDepartmentId(Long parentDepartmentId);
    List<Department> findByParentDepartmentIsNull();
    List<Department> findByOwnerEmail(String email);
}
