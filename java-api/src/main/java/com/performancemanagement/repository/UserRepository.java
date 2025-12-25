package com.performancemanagement.repository;

import com.performancemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.tenant.fqdn = :tenantId")
    Optional<User> findByEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.tenant.fqdn = :tenantId")
    boolean existsByEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    @Query("SELECT u FROM User u WHERE u.tenant.fqdn = :tenantId")
    List<User> findAllByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.tenant.fqdn = :tenantId")
    Optional<User> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);
    
    @Query("SELECT u FROM User u WHERE u.department.id = :departmentId AND u.tenant.fqdn = :tenantId")
    List<User> findByDepartmentIdAndTenantId(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);
    
    // Legacy methods for backward compatibility - will be filtered by service layer
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
