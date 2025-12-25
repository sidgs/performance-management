package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.dto.KPIDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.repository.KPIRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KPIRepository kpiRepository;

    @Autowired
    private DepartmentRepository departmentRepository;
    
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

    @CacheEvict(value = {"goals", "goal", "goalsByOwner"}, allEntries = true)
    public GoalDTO createGoal(GoalDTO goalDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        User owner = userRepository.findByEmailAndTenantId(goalDTO.getOwnerEmail(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Goal goal = new Goal();
        goal.setTenant(TenantContext.getCurrentTenant());
        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setOwner(owner);
        goal.setCreationDate(goalDTO.getCreationDate() != null ? goalDTO.getCreationDate() : LocalDate.now());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        goal.setTargetCompletionDate(goalDTO.getTargetCompletionDate());
        goal.setStatus(goalDTO.getStatus() != null ? goalDTO.getStatus() : Goal.GoalStatus.DRAFT);
        goal.setConfidential(goalDTO.getConfidential() != null ? goalDTO.getConfidential() : false);

        if (goalDTO.getParentGoalId() != null) {
            Goal parent = goalRepository.findByIdAndTenantId(goalDTO.getParentGoalId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent goal not found"));
            goal.setParentGoal(parent);
        }

        Goal savedGoal = goalRepository.save(goal);
        
        // Create KPIs if provided
        if (goalDTO.getKpis() != null && !goalDTO.getKpis().isEmpty()) {
            for (KPIDTO kpiDTO : goalDTO.getKpis()) {
                KPI kpi = new KPI();
                kpi.setTenant(savedGoal.getTenant());
                kpi.setGoal(savedGoal);
                kpi.setDescription(kpiDTO.getDescription());
                kpi.setDueDate(kpiDTO.getDueDate());
                kpi.setStatus(kpiDTO.getStatus() != null ? kpiDTO.getStatus() : KPI.KPIStatus.NOT_STARTED);
                kpi.setCompletionPercentage(kpiDTO.getCompletionPercentage() != null ? kpiDTO.getCompletionPercentage() : 0);
                if (kpi.getCompletionPercentage() == 100) {
                    kpi.setStatus(KPI.KPIStatus.ACHIEVED);
                }
                kpiRepository.save(kpi);
            }
        }
        
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner"}, allEntries = true)
    public GoalDTO updateGoal(Long id, GoalDTO goalDTO) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (goal.getLocked()) {
            throw new IllegalStateException("Cannot update a locked goal. Only the owner can unlock it.");
        }

        // Business rule: A goal in PUBLISHED or APPROVED state cannot be moved to DRAFT, ARCHIVED, or RETIRED
        // if it has child goals which are in PUBLISHED or APPROVED state
        if (goalDTO.getStatus() != null && goalDTO.getStatus() != goal.getStatus()) {
            Goal.GoalStatus currentStatus = goal.getStatus();
            Goal.GoalStatus newStatus = goalDTO.getStatus();
            
            // Check if trying to move from PUBLISHED or APPROVED to DRAFT, ARCHIVED, or RETIRED
            boolean isMovingFromPublishedOrApproved = (currentStatus == Goal.GoalStatus.PUBLISHED || 
                                                       currentStatus == Goal.GoalStatus.APPROVED);
            boolean isMovingToRestrictedStatus = (newStatus == Goal.GoalStatus.DRAFT || 
                                                 newStatus == Goal.GoalStatus.ARCHIVED ||
                                                 newStatus == Goal.GoalStatus.RETIRED);
            
            if (isMovingFromPublishedOrApproved && isMovingToRestrictedStatus) {
                // Check if goal has child goals in PUBLISHED or APPROVED state
                if (goal.getChildGoals() != null && !goal.getChildGoals().isEmpty()) {
                    boolean hasPublishedOrApprovedChild = goal.getChildGoals().stream()
                            .anyMatch(child -> child.getStatus() == Goal.GoalStatus.PUBLISHED || 
                                            child.getStatus() == Goal.GoalStatus.APPROVED);
                    
                    if (hasPublishedOrApprovedChild) {
                        throw new IllegalStateException(
                            "Cannot change goal status from " + currentStatus + " to " + newStatus + 
                            ". This goal has child goals that are in PUBLISHED or APPROVED state. " +
                            "Please change the status of child goals first."
                        );
                    }
                }
            }
        }

        goal.setShortDescription(goalDTO.getShortDescription());
        goal.setLongDescription(goalDTO.getLongDescription());
        goal.setCompletionDate(goalDTO.getCompletionDate());
        
        if (goalDTO.getTargetCompletionDate() != null) {
            goal.setTargetCompletionDate(goalDTO.getTargetCompletionDate());
        }
        
        if (goalDTO.getStatus() != null) {
            goal.setStatus(goalDTO.getStatus());
        }
        
        if (goalDTO.getConfidential() != null) {
            goal.setConfidential(goalDTO.getConfidential());
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
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null; // Tenant validation disabled
        }
        Goal goal = goalRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        return convertToDTO(goal);
    }

    @Cacheable(value = "goals")
    public List<GoalDTO> getAllGoals() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            // If no user is logged in, return empty list
            return List.of();
        }
        
        // Filter goals to only include:
        // 1. Goals owned by the current user
        // 2. Goals assigned to the current user
        // 3. Goals owned by users in the current user's department
        // 4. Goals assigned to users in the current user's department
        Department userDepartment = currentUser.getDepartment();
        List<Goal> goals;
        if (userDepartment != null) {
            goals = goalRepository.findGoalsForUserAndDepartment(
                tenantId, 
                currentUser.getId(), 
                userDepartment.getId()
            );
        } else {
            // User has no department, only return goals owned by or assigned to the user
            goals = goalRepository.findGoalsForUser(tenantId, currentUser.getId());
        }
        
        // Filter confidential goals: only show if user is owner or assigned
        return goals.stream()
                .filter(goal -> {
                    if (goal.getConfidential() != null && goal.getConfidential()) {
                        // Confidential goal: only show if user is owner or assigned
                        boolean isOwner = goal.getOwner().getId().equals(currentUser.getId());
                        boolean isAssigned = goal.getAssignedUsers().stream()
                                .anyMatch(user -> user.getId().equals(currentUser.getId()));
                        return isOwner || isAssigned;
                    }
                    // Non-confidential goal: show based on existing department filtering
                    return true;
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<GoalDTO> getAllGoalsForHR() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return List.of();
        }
        
        // Get all goals for the tenant
        List<Goal> allGoals = goalRepository.findAllByTenantId(tenantId);
        
        // For HR admins, return all goals but mask confidential details for goals they can't access
        return allGoals.stream()
                .map(goal -> {
                    GoalDTO dto = convertToDTO(goal);
                    
                    // If goal is confidential and user is not owner or assigned, mask the details
                    if (goal.getConfidential() != null && goal.getConfidential()) {
                        boolean isOwner = goal.getOwner().getId().equals(currentUser.getId());
                        boolean isAssigned = goal.getAssignedUsers().stream()
                                .anyMatch(user -> user.getId().equals(currentUser.getId()));
                        
                        if (!isOwner && !isAssigned) {
                            // Mask confidential details
                            dto.setShortDescription("Confidential Goal");
                            dto.setLongDescription("This goal is confidential and you do not have access to view its details.");
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<GoalDTO> getGoalsByOwner(String email) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of(); // Tenant validation disabled - return empty list
        }
        return goalRepository.findByOwnerEmailAndTenantId(email, tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoalDTO assignGoalToUser(Long goalId, String userEmail) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        if (goal.getLocked()) {
            throw new IllegalStateException("Cannot assign users to a locked goal");
        }
        
        // Validate that goal has at least one KPI
        List<KPI> kpis = kpiRepository.findByGoalIdAndTenantId(goalId, tenantId);
        if (kpis == null || kpis.isEmpty()) {
            throw new IllegalStateException("Cannot assign a goal without KPIs. A goal must have at least one KPI.");
        }
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate that the user being assigned is either the goal owner or a member of the goal owner's department
        User goalOwner = goal.getOwner();
        boolean isOwner = Objects.equals(user.getId(), goalOwner.getId());
        boolean isInOwnerDepartment = false;
        
        if (!isOwner && goalOwner.getDepartment() != null) {
            Department ownerDepartment = goalOwner.getDepartment();
            if (user.getDepartment() != null) {
                isInOwnerDepartment = Objects.equals(user.getDepartment().getId(), ownerDepartment.getId());
            }
        }
        
        if (!isOwner && !isInOwnerDepartment) {
            throw new IllegalStateException(
                "Goals can only be assigned to the goal owner or members of the goal owner's department. " +
                "The user you are trying to assign is not the goal owner and is not in the same department."
            );
        }

        // Check if user belongs to a department and if approval is needed
        Department userDepartment = user.getDepartment();
        if (userDepartment != null) {
            User departmentManager = userDepartment.getManager();
            User managerAssistant = userDepartment.getManagerAssistant();
            
            // Check if goal owner is department manager or assistant
            boolean isManagerOrAssistant = (departmentManager != null && Objects.equals(departmentManager.getId(), goalOwner.getId())) ||
                                          (managerAssistant != null && Objects.equals(managerAssistant.getId(), goalOwner.getId()));
            
            // If goal owner is not manager or assistant, require approval
            if (!isManagerOrAssistant) {
                goal.setStatus(Goal.GoalStatus.PENDING_APPROVAL);
            }
        }

        // Set or update assigned date
        goal.setAssignedDate(LocalDate.now());
        
        goal.getAssignedUsers().add(user);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public GoalDTO unassignGoalFromUser(Long goalId, String userEmail) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        if (goal.getLocked()) {
            throw new IllegalStateException("Cannot unassign users from a locked goal");
        }
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        goal.getAssignedUsers().remove(user);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public GoalDTO lockGoal(Long goalId) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        goal.setLocked(true);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public GoalDTO unlockGoal(Long goalId, String ownerEmail) {
        String tenantId = requireTenantId(); // Mutations require tenant
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        if (!goal.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalStateException("Only the goal owner can unlock a goal");
        }
        
        goal.setLocked(false);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner"}, allEntries = true)
    public void deleteGoal(Long id) {
        String tenantId = requireTenantId(); // Mutations require tenant
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
        
        String tenantId = goal.getTenant().getFqdn();
        
        if (goal.getChildGoals() != null && !goal.getChildGoals().isEmpty()) {
            dto.setChildGoals(goal.getChildGoals().stream()
                    .filter(child -> child.getTenant().getFqdn().equals(tenantId))
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (goal.getAssignedUsers() != null && !goal.getAssignedUsers().isEmpty()) {
            dto.setAssignedUserEmails(goal.getAssignedUsers().stream()
                    .filter(user -> user.getTenant().getFqdn().equals(tenantId))
                    .map(User::getEmail)
                    .collect(Collectors.toList()));
        }
        
        dto.setLocked(goal.getLocked() != null ? goal.getLocked() : false);
        dto.setConfidential(goal.getConfidential() != null ? goal.getConfidential() : false);
        
        return dto;
    }
    
    @CacheEvict(value = {"goals", "goal", "goalsByOwner"}, allEntries = true)
    public GoalDTO updateTargetCompletionDate(Long goalId, LocalDate targetCompletionDate) {
        String tenantId = requireTenantId();
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        goal.setTargetCompletionDate(targetCompletionDate);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    @CacheEvict(value = {"goals", "goal", "goalsByOwner"}, allEntries = true)
    public GoalDTO approveGoal(Long goalId) {
        String tenantId = requireTenantId();
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        if (goal.getStatus() != Goal.GoalStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Goal is not pending approval");
        }
        
        // Verify that the current user is a department manager for at least one assigned user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        boolean canApprove = false;
        for (User assignedUser : goal.getAssignedUsers()) {
            if (assignedUser.getDepartment() != null) {
                Department department = assignedUser.getDepartment();
                if (department.getManager() != null && 
                    Objects.equals(department.getManager().getId(), currentUser.getId())) {
                    canApprove = true;
                    break;
                }
            }
        }
        
        if (!canApprove) {
            throw new IllegalStateException("Only department managers can approve goals assigned to their department members");
        }
        
        goal.setStatus(Goal.GoalStatus.APPROVED);
        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public List<GoalDTO> getGoalsPendingApprovalForDepartment(Long departmentId) {
        String tenantId = requireTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        // Validate department exists
        departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        return goalRepository.findAllByTenantId(tenantId).stream()
                .filter(goal -> goal.getStatus() == Goal.GoalStatus.PENDING_APPROVAL)
                .filter(goal -> goal.getAssignedUsers().stream()
                        .anyMatch(user -> user.getDepartment() != null && 
                                Objects.equals(user.getDepartment().getId(), departmentId)))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GoalDTO> getDepartmentMembersGoals(Long departmentId) {
        String tenantId = requireTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        // Validate department exists
        departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        return goalRepository.findAllByTenantId(tenantId).stream()
                .filter(goal -> goal.getAssignedUsers().stream()
                        .anyMatch(user -> user.getDepartment() != null && 
                                Objects.equals(user.getDepartment().getId(), departmentId)))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
