package com.performancemanagement.service;

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

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public GoalDTO createGoal(GoalDTO goalDTO) {
        User owner = userRepository.findByEmail(goalDTO.getOwnerEmail())
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Goal goal = new Goal();
        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setOwner(owner);
        goal.setCreationDate(goalDTO.getCreationDate() != null ? goalDTO.getCreationDate() : LocalDate.now());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        goal.setStatus(goalDTO.getStatus() != null ? goalDTO.getStatus() : Goal.GoalStatus.DRAFT);

        if (goalDTO.getParentGoalId() != null) {
            Goal parent = goalRepository.findById(goalDTO.getParentGoalId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent goal not found"));
            goal.setParentGoal(parent);
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public GoalDTO updateGoal(Long id, GoalDTO goalDTO) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        
        if (goalDTO.getStatus() != null) {
            goal.setStatus(goalDTO.getStatus());
        }

        if (goalDTO.getParentGoalId() != null) {
            Goal parent = goalRepository.findById(goalDTO.getParentGoalId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent goal not found"));
            goal.setParentGoal(parent);
        } else {
            goal.setParentGoal(null);
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public GoalDTO getGoalById(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        return convertToDTO(goal);
    }

    @Cacheable(value = "goals")
    public List<GoalDTO> getAllGoals() {
        return goalRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GoalDTO> getGoalsByOwner(String email) {
        return goalRepository.findByOwnerEmail(email).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "rootGoals")
    public List<GoalDTO> getRootGoals() {
        return goalRepository.findByParentGoalIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoalDTO assignGoalToUser(Long goalId, String userEmail) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        goal.getAssignedUsers().add(user);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner", "rootGoals"}, allEntries = true)
    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
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
        
        if (goal.getChildGoals() != null && !goal.getChildGoals().isEmpty()) {
            dto.setChildGoals(goal.getChildGoals().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (goal.getAssignedUsers() != null && !goal.getAssignedUsers().isEmpty()) {
            dto.setAssignedUserEmails(goal.getAssignedUsers().stream()
                    .map(User::getEmail)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
