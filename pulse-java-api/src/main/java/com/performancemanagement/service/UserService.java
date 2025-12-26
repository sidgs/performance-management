package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.UserDTO;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

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

    public UserDTO createUser(UserDTO userDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        if (userRepository.existsByEmailAndTenantId(userDTO.getEmail(), tenantId)) {
            throw new IllegalArgumentException("User with email " + userDTO.getEmail() + " already exists");
        }

        User user = new User();
        user.setTenant(TenantContext.getCurrentTenant());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setTitle(userDTO.getTitle());

        // Default role is USER unless explicitly provided as EPM_ADMIN
        if ("EPM_ADMIN".equalsIgnoreCase(userDTO.getRole())) {
            user.setRole(User.Role.EPM_ADMIN);
        } else {
            user.setRole(User.Role.USER);
        }

        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findByIdAndTenantId(userDTO.getManagerId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            user.setManager(manager);
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @CacheEvict(value = {"users", "user", "userByEmail"}, allEntries = true)
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        User user = userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setTitle(userDTO.getTitle());

        // Allow updating role if provided
        if (userDTO.getRole() != null) {
            if ("EPM_ADMIN".equalsIgnoreCase(userDTO.getRole())) {
                user.setRole(User.Role.EPM_ADMIN);
            } else {
                user.setRole(User.Role.USER);
            }
        }

        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findByIdAndTenantId(userDTO.getManagerId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            user.setManager(manager);
        } else {
            user.setManager(null);
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Cacheable(value = "user", key = "#id")
    public UserDTO getUserById(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled
        }
        User user = userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled
        }
        User user = userRepository.findByEmailAndTenantId(email, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return convertToDTO(user);
    }

    @Cacheable(value = "users")
    public List<UserDTO> getAllUsers() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        return userRepository.findAllByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteUser(Long id) {
        String tenantId = requireTenantId(); // Mutations require tenant
        User user = userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }

    @Cacheable(value = "teamMembers", key = "#managerId")
    public List<UserDTO> getTeamMembers(Long managerId) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        User manager = userRepository.findByIdAndTenantId(managerId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        return manager.getTeamMembers().stream()
                .filter(teamMember -> teamMember.getTenant().getFqdn().equals(tenantId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setTitle(user.getTitle());

        if (user.getRole() != null) {
            dto.setRole(user.getRole().name());
        }
        
        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getId());
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getManager() != null) {
            dto.setManagerId(user.getManager().getId());
            dto.setManagerEmail(user.getManager().getEmail());
        }
        
        return dto;
    }
}
