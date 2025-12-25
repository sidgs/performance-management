package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.DepartmentDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;
    
    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId(); // Returns null if no tenant context - tenant validation is disabled
    }
    
    private String requireTenantId() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required for this operation");
        }
        return tenantId;
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        User owner = userRepository.findByEmailAndTenantId(departmentDTO.getOwnerEmail(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Department department = new Department();
        department.setTenant(TenantContext.getCurrentTenant());
        department.setName(departmentDTO.getName());
        department.setSmallDescription(departmentDTO.getSmallDescription());
        department.setOwner(owner);
        department.setCreationDate(departmentDTO.getCreationDate() != null ? departmentDTO.getCreationDate() : LocalDate.now());
        department.setStatus(departmentDTO.getStatus() != null ? departmentDTO.getStatus() : Department.DepartmentStatus.ACTIVE);

        if (departmentDTO.getCoOwnerEmail() != null) {
            User coOwner = userRepository.findByEmailAndTenantId(departmentDTO.getCoOwnerEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Co-owner not found"));
            department.setCoOwner(coOwner);
        }

        if (departmentDTO.getParentDepartmentId() != null) {
            Department parent = departmentRepository.findByIdAndTenantId(departmentDTO.getParentDepartmentId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent department not found"));
            department.setParentDepartment(parent);
        }

        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }

    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        department.setName(departmentDTO.getName());
        department.setSmallDescription(departmentDTO.getSmallDescription());
        
        if (departmentDTO.getStatus() != null) {
            department.setStatus(departmentDTO.getStatus());
        }

        if (departmentDTO.getCoOwnerEmail() != null) {
            User coOwner = userRepository.findByEmailAndTenantId(departmentDTO.getCoOwnerEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Co-owner not found"));
            department.setCoOwner(coOwner);
        } else {
            department.setCoOwner(null);
        }

        if (departmentDTO.getParentDepartmentId() != null) {
            Department parent = departmentRepository.findByIdAndTenantId(departmentDTO.getParentDepartmentId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent department not found"));
            department.setParentDepartment(parent);
        } else {
            department.setParentDepartment(null);
        }

        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }

    @Cacheable(value = "department", key = "#id")
    public DepartmentDTO getDepartmentById(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled
        }
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return convertToDTO(department);
    }

    public List<DepartmentDTO> getAllDepartments() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        return departmentRepository.findAllByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "rootDepartments")
    public List<DepartmentDTO> getRootDepartments() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        return departmentRepository.findByParentDepartmentIsNullAndTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO assignUserToDepartment(Long departmentId, String userEmail) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setDepartment(department);
        userRepository.save(user);
        
        return convertToDTO(department);
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public void deleteDepartment(Long id) {
        String tenantId = requireTenantId(); // Mutations require tenant
        Department department = departmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        departmentRepository.delete(department);
    }

    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setSmallDescription(department.getSmallDescription());
        dto.setOwnerEmail(department.getOwner().getEmail());
        dto.setOwnerName(department.getOwner().getFirstName() + " " + department.getOwner().getLastName());
        dto.setCreationDate(department.getCreationDate());
        dto.setStatus(department.getStatus());
        
        if (department.getCoOwner() != null) {
            dto.setCoOwnerEmail(department.getCoOwner().getEmail());
            dto.setCoOwnerName(department.getCoOwner().getFirstName() + " " + department.getCoOwner().getLastName());
        }
        
        if (department.getParentDepartment() != null) {
            dto.setParentDepartmentId(department.getParentDepartment().getId());
        }
        
        String tenantId = department.getTenant().getFqdn();
        
        if (department.getChildDepartments() != null && !department.getChildDepartments().isEmpty()) {
            dto.setChildDepartments(department.getChildDepartments().stream()
                    .filter(child -> child.getTenant().getFqdn().equals(tenantId))
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (department.getUsers() != null && !department.getUsers().isEmpty()) {
            dto.setUserEmails(department.getUsers().stream()
                    .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                    .map(User::getEmail)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
