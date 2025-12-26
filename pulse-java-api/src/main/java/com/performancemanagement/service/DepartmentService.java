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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
        
        Department department = new Department();
        department.setTenant(TenantContext.getCurrentTenant());
        department.setName(departmentDTO.getName());
        department.setSmallDescription(departmentDTO.getSmallDescription());
        
        // Manager is optional
        if (departmentDTO.getManagerEmail() != null && !departmentDTO.getManagerEmail().trim().isEmpty()) {
            User manager = userRepository.findByEmailAndTenantId(departmentDTO.getManagerEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            department.setManager(manager);
        }
        
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
            
            // Validate that parent is not the department itself or a descendant
            // This prevents circular parent relationships
            if (hasCircularParentRelationship(department, parent)) {
                throw new IllegalStateException(
                    "Cannot set parent department. This would create a circular parent relationship. " +
                    "A department cannot be its own parent or ancestor."
                );
            }
            
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
            
            // Validate that parent is not the department itself or a descendant
            // This prevents circular parent relationships
            if (hasCircularParentRelationship(department, parent)) {
                throw new IllegalStateException(
                    "Cannot set parent department. This would create a circular parent relationship. " +
                    "A department cannot be its own parent or ancestor."
                );
            }
            
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

    public List<UserDTO> getEligibleManagersForDepartment(Long departmentId) {
        String tenantId = requireTenantId();
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        // Get all users in the tenant
        List<User> allUsers = userRepository.findAllByTenantId(tenantId);
        
        // Filter to only include users that would not create circular relationships
        return allUsers.stream()
                .filter(user -> !hasCircularManagementRelationship(user, department))
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
        
        // Check for circular management relationship
        if (hasCircularManagementRelationship(manager, department)) {
            throw new IllegalStateException(
                "Cannot set " + manager.getFirstName() + " " + manager.getLastName() + 
                " as manager. This would create a circular management relationship. " +
                "One or more department members manage this user (directly or indirectly)."
            );
        }
        
        department.setManager(manager);
        Department savedDepartment = departmentRepository.save(department);
        return convertToDTO(savedDepartment);
    }
    
    /**
     * Recursively collects all users in a department and its sub-departments.
     */
    private Set<User> getAllUsersInDepartment(Department department) {
        Set<User> allUsers = new HashSet<>();
        
        // Add direct members of the department
        if (department.getUsers() != null) {
            allUsers.addAll(department.getUsers());
        }
        
        // Recursively add users from child departments
        if (department.getChildDepartments() != null) {
            for (Department childDepartment : department.getChildDepartments()) {
                allUsers.addAll(getAllUsersInDepartment(childDepartment));
            }
        }
        
        return allUsers;
    }
    
    /**
     * Checks if setting a user as manager of a department would create a circular management relationship.
     * A circular relationship occurs if any user in the department (including sub-departments) 
     * manages the potential manager (directly or indirectly).
     */
    private boolean hasCircularManagementRelationship(User potentialManager, Department department) {
        Set<User> allDepartmentUsers = getAllUsersInDepartment(department);
        
        // For each user in the department, check if they manage the potential manager
        for (User departmentUser : allDepartmentUsers) {
            User currentUser = departmentUser;
            Set<User> visited = new HashSet<>(); // Prevent infinite loops in case of circular manager chains
            
            // Traverse manager chain upward
            while (currentUser != null && currentUser.getManager() != null) {
                if (visited.contains(currentUser)) {
                    break; // Circular manager chain detected, but not our concern here
                }
                visited.add(currentUser);
                
                // Check if this user's manager is the potential manager
                if (currentUser.getManager().getId().equals(potentialManager.getId())) {
                    return true; // Circular relationship detected: potentialManager manages departmentUser
                }
                currentUser = currentUser.getManager();
            }
        }
        
        return false; // No circular relationship
    }
    
    /**
     * Checks if setting a parent department would create a circular parent relationship.
     * A circular relationship occurs if the parent department is the department itself or 
     * if the parent department is a descendant of the department.
     */
    private boolean hasCircularParentRelationship(Department department, Department potentialParent) {
        // Cannot be its own parent
        if (department.getId() != null && department.getId().equals(potentialParent.getId())) {
            return true;
        }
        
        // Check if potential parent is a descendant of the department
        // Traverse up the parent chain from potentialParent to see if we reach department
        Department current = potentialParent;
        Set<Long> visited = new HashSet<>(); // Prevent infinite loops
        
        while (current != null && current.getParentDepartment() != null) {
            if (visited.contains(current.getId())) {
                break; // Circular parent chain detected
            }
            visited.add(current.getId());
            
            // Check if this parent is the department we're trying to set as child
            if (department.getId() != null && current.getParentDepartment().getId().equals(department.getId())) {
                return true; // Circular relationship: department would be parent of its own ancestor
            }
            current = current.getParentDepartment();
        }
        
        return false; // No circular relationship
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
        
        // Manager is optional
        if (department.getManager() != null) {
            dto.setManagerEmail(department.getManager().getEmail());
            dto.setManagerName(department.getManager().getFirstName() + " " + department.getManager().getLastName());
        }
        
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
