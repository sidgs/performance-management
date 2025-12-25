package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.dto.DepartmentDTO;
import com.performancemanagement.dto.UserDTO;
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
        
        User manager = userRepository.findByEmailAndTenantId(departmentDTO.getManagerEmail(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        Department department = new Department();
        department.setTenant(TenantContext.getCurrentTenant());
        department.setName(departmentDTO.getName());
        department.setSmallDescription(departmentDTO.getSmallDescription());
        department.setManager(manager);
        department.setCreationDate(departmentDTO.getCreationDate() != null ? departmentDTO.getCreationDate() : LocalDate.now());
        department.setStatus(departmentDTO.getStatus() != null ? departmentDTO.getStatus() : Department.DepartmentStatus.ACTIVE);

        if (departmentDTO.getManagerAssistantEmail() != null) {
            User managerAssistant = userRepository.findByEmailAndTenantId(departmentDTO.getManagerAssistantEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager assistant not found"));
            department.setManagerAssistant(managerAssistant);
        }

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

        if (departmentDTO.getManagerAssistantEmail() != null) {
            User managerAssistant = userRepository.findByEmailAndTenantId(departmentDTO.getManagerAssistantEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager assistant not found"));
            department.setManagerAssistant(managerAssistant);
        } else {
            department.setManagerAssistant(null);
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

    public List<DepartmentDTO> getDepartmentsManagedByMe() {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return departmentRepository.findByManagerIdAndTenantId(currentUser.getId(), tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DepartmentDTO> getDepartmentsWhereAssistant() {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return departmentRepository.findByManagerAssistantIdAndTenantId(currentUser.getId(), tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getDepartmentMembers(Long departmentId) {
        String tenantId = requireTenantId();
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        return department.getUsers().stream()
                .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                .map(user -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(user.getId());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setTitle(user.getTitle());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public DepartmentDTO assignManagerAssistant(Long departmentId, String assistantEmail) {
        String tenantId = requireTenantId();
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        User assistant = userRepository.findByEmailAndTenantId(assistantEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Manager assistant not found"));
        
        department.setManagerAssistant(assistant);
        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public DepartmentDTO setDepartmentManager(Long departmentId, String managerEmail) {
        String tenantId = requireTenantId();
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        User manager = userRepository.findByEmailAndTenantId(managerEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        
        department.setManager(manager);
        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public DepartmentDTO moveUserToDepartment(Long userId, Long newDepartmentId) {
        String tenantId = requireTenantId();
        
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Department newDepartment = departmentRepository.findByIdAndTenantId(newDepartmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("New department not found"));
        
        user.setDepartment(newDepartment);
        userRepository.save(user);
        
        return convertToDTO(newDepartment);
    }

    @CacheEvict(value = {"departments", "department", "rootDepartments"}, allEntries = true)
    public DepartmentDTO removeUserFromDepartment(Long userId, Long departmentId) {
        String tenantId = requireTenantId();
        
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        if (user.getDepartment() == null || !user.getDepartment().getId().equals(departmentId)) {
            throw new IllegalArgumentException("User is not a member of this department");
        }
        
        user.setDepartment(null);
        userRepository.save(user);
        
        return convertToDTO(department);
    }

    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setSmallDescription(department.getSmallDescription());
        dto.setManagerEmail(department.getManager().getEmail());
        dto.setManagerName(department.getManager().getFirstName() + " " + department.getManager().getLastName());
        dto.setCreationDate(department.getCreationDate());
        dto.setStatus(department.getStatus());
        
        if (department.getManagerAssistant() != null) {
            dto.setManagerAssistantEmail(department.getManagerAssistant().getEmail());
            dto.setManagerAssistantName(department.getManagerAssistant().getFirstName() + " " + department.getManagerAssistant().getLastName());
        }
        
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
