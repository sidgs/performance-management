package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.GoalRepository;
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
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;
    
    private Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public GoalDTO createGoal(GoalDTO goalDTO) {
        Long tenantId = getCurrentTenantId();
        
        User owner = userRepository.findByEmailAndTenantId(goalDTO.getOwnerEmail(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Goal goal = new Goal();
        goal.setTenant(TenantContext.getCurrentTenant());
        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setOwner(owner);
        goal.setCreationDate(goalDTO.getCreationDate() != null ? goalDTO.getCreationDate() : LocalDate.now());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        goal.setStatus(goalDTO.getStatus() != null ? goalDTO.getStatus() : Goal.GoalStatus.DRAFT);

        if (goalDTO.getParentGoalId() != null) {
            Goal parent = goalRepository.findByIdAndTenantId(goalDTO.getParentGoalId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent goal not found"));
            goal.setParentGoal(parent);
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public GoalDTO updateGoal(Long id, GoalDTO goalDTO) {
        Long tenantId = getCurrentTenantId();
        
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        
        if (goalDTO.getStatus() != null) {
            goal.setStatus(goalDTO.getStatus());
        }

        if (goalDTO.getParentGoalId() != null) {
            Goal parent = goalRepository.findByIdAndTenantId(goalDTO.getParentGoalId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent goal not found"));
            goal.setParentGoal(parent);
        } else {
            goal.setParentGoal(null);
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public GoalDTO getGoalById(Long id) {
        Long tenantId = getCurrentTenantId();
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        return convertToDTO(goal);
    }

    @Cacheable(value = "goals")
    public List<GoalDTO> getAllGoals() {
        Long tenantId = getCurrentTenantId();
        return goalRepository.findAllByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GoalDTO> getGoalsByOwner(String email) {
        Long tenantId = getCurrentTenantId();
        return goalRepository.findByOwnerEmailAndTenantId(email, tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "rootGoals")
    public List<GoalDTO> getRootGoals() {
        Long tenantId = getCurrentTenantId();
        return goalRepository.findByParentGoalIsNullAndTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoalDTO assignGoalToUser(Long goalId, String userEmail) {
        Long tenantId = getCurrentTenantId();
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        goal.getAssignedUsers().add(user);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public void deleteGoal(Long id) {
        Long tenantId = getCurrentTenantId();
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalDTO convertToDTO(Goal goal) {
        GoalDTO dto = new GoalDTO();
        dto.setId(goal.getId());
        dto.setShortDescription(goal.getShortDescription());
        dto.setLongDescription(goal.getLongDescription());
        dto.setOwnerEmail(goal.getOwner().getEmail());
        dto.setOwnerName(goal.getOwner().getFirstName() + " " + goal.getOwner().getLastName());
        dto.setCreationDate(goal.getCreationDate());
        dto.setCompletionDate(goal.getCompletionDate());
        dto.setStatus(goal.getStatus());
        
        if (goal.getParentGoal() != null) {
            dto.setParentGoalId(goal.getParentGoal().getId());
        }
        
        Long tenantId = goal.getTenant().getId();
        
        if (goal.getChildGoals() != null && !goal.getChildGoals().isEmpty()) {
            dto.setChildGoals(goal.getChildGoals().stream()
                    .filter(child -> child.getTenant().getId().equals(tenantId))
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (goal.getAssignedUsers() != null && !goal.getAssignedUsers().isEmpty()) {
            dto.setAssignedUserEmails(goal.getAssignedUsers().stream()
                    .filter(user -> user.getTenant().getId().equals(tenantId))
                    .map(User::getEmail)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
