package com.performancemanagement.service;

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

    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("User with email " + userDTO.getEmail() + " already exists");
        }

        User user = new User();
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setTitle(userDTO.getTitle());

        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findById(userDTO.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            user.setManager(manager);
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @CacheEvict(value = {"users", "user", "userByEmail"}, allEntries = true)
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setTitle(userDTO.getTitle());

        if (userDTO.getManagerId() != null) {
            User manager = userRepository.findById(userDTO.getManagerId())
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return convertToDTO(user);
    }

    @Cacheable(value = "users")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Cacheable(value = "teamMembers", key = "#managerId")
    public List<UserDTO> getTeamMembers(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        return manager.getTeamMembers().stream()
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
