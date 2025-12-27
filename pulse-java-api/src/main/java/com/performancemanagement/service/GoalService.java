package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.dto.KPIDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.Team;
import com.performancemanagement.model.Territory;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.TerritoryRepository;
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
    private TerritoryService territoryService;

    @Autowired
    private TerritoryRepository territoryRepository;

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

    /**
     * Check if a user can view a goal based on RBAC rules:
     * 1. User owns the goal or is assigned to it
     * 2. User is department manager of goal owner's or assigned user's department
     * 3. User is team lead of goal owner's or assigned user's team
     * 4. Exclude goals owned by user's manager
     * 5. Otherwise return false
     */
    public boolean canUserViewGoal(User currentUser, Goal goal) {
        if (currentUser == null || goal == null) {
            return false;
        }

        // Rule 1: User owns the goal or is assigned to it
        if (goal.getOwner() != null && Objects.equals(goal.getOwner().getId(), currentUser.getId())) {
            return true;
        }
        
        if (goal.getAssignedUsers() != null) {
            boolean isAssigned = goal.getAssignedUsers().stream()
                    .anyMatch(user -> Objects.equals(user.getId(), currentUser.getId()));
            if (isAssigned) {
                return true;
            }
        }

        // Exclusion: User should NOT see goals owned by their manager
        if (goal.getOwner() != null && currentUser.getManager() != null &&
            Objects.equals(goal.getOwner().getId(), currentUser.getManager().getId())) {
            return false;
        }

        // Rule 2: User is department manager of goal owner's or assigned user's department
        if (goal.getOwner() != null && goal.getOwner().getDepartment() != null) {
            Department ownerDepartment = goal.getOwner().getDepartment();
            if (ownerDepartment.getManager() != null && 
                Objects.equals(ownerDepartment.getManager().getId(), currentUser.getId())) {
                return true;
            }
        }
        
        // Check assigned users' departments
        if (goal.getAssignedUsers() != null) {
            for (User assignedUser : goal.getAssignedUsers()) {
                if (assignedUser.getDepartment() != null) {
                    Department assignedUserDepartment = assignedUser.getDepartment();
                    if (assignedUserDepartment.getManager() != null && 
                        Objects.equals(assignedUserDepartment.getManager().getId(), currentUser.getId())) {
                        return true;
                    }
                }
            }
        }

        // Rule 3: User is team lead of goal owner's or assigned user's team
        if (goal.getOwner() != null && goal.getOwner().getTeam() != null) {
            Team ownerTeam = goal.getOwner().getTeam();
            if (ownerTeam.getTeamLead() != null && 
                Objects.equals(ownerTeam.getTeamLead().getId(), currentUser.getId())) {
                return true;
            }
        }
        
        // Check assigned users' teams
        if (goal.getAssignedUsers() != null) {
            for (User assignedUser : goal.getAssignedUsers()) {
                if (assignedUser.getTeam() != null) {
                    Team assignedUserTeam = assignedUser.getTeam();
                    if (assignedUserTeam.getTeamLead() != null && 
                        Objects.equals(assignedUserTeam.getTeamLead().getId(), currentUser.getId())) {
                        return true;
                    }
                }
            }
        }

        // Rule 4: No other goals
        return false;
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

        // Handle territory - default to Global if not provided
        if (goalDTO.getTerritoryId() != null) {
            Territory territory = territoryRepository.findByIdAndTenantId(goalDTO.getTerritoryId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Territory not found"));
            goal.setTerritory(territory);
        } else {
            // Default to Global territory
            Territory globalTerritory = territoryService.ensureGlobalTerritory();
            goal.setTerritory(globalTerritory);
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

        // Update territory if provided
        if (goalDTO.getTerritoryId() != null) {
            Territory territory = territoryRepository.findByIdAndTenantId(goalDTO.getTerritoryId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Territory not found"));
            goal.setTerritory(territory);
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
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("You do not have permission to view this goal");
        }
        
        // Ensure lazy-loaded relationships are accessible within transaction
        if (goal.getOwner() != null) {
            goal.getOwner().getId();
            if (goal.getOwner().getDepartment() != null) {
                goal.getOwner().getDepartment().getId();
            }
            if (goal.getOwner().getTeam() != null) {
                goal.getOwner().getTeam().getId();
            }
        }
        if (goal.getAssignedUsers() != null) {
            goal.getAssignedUsers().forEach(user -> {
                user.getId();
                if (user.getDepartment() != null) {
                    user.getDepartment().getId();
                }
                if (user.getTeam() != null) {
                    user.getTeam().getId();
                }
            });
        }
        if (currentUser.getDepartment() != null) {
            currentUser.getDepartment().getId();
        }
        if (currentUser.getTeam() != null) {
            currentUser.getTeam().getId();
        }
        
        // Check authorization
        if (!canUserViewGoal(currentUser, goal)) {
            throw new IllegalStateException("You do not have permission to view this goal");
        }
        
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
        
        // Fetch all goals for the tenant
        List<Goal> allGoals = goalRepository.findAllByTenantId(tenantId);
        
        // Ensure lazy-loaded relationships are accessible within transaction
        // Access relationships to trigger lazy loading
        allGoals.forEach(goal -> {
            if (goal.getOwner() != null) {
                goal.getOwner().getId(); // Access to trigger loading
                if (goal.getOwner().getDepartment() != null) {
                    goal.getOwner().getDepartment().getId();
                }
                if (goal.getOwner().getTeam() != null) {
                    goal.getOwner().getTeam().getId();
                }
            }
            if (goal.getAssignedUsers() != null) {
                goal.getAssignedUsers().forEach(user -> {
                    user.getId();
                    if (user.getDepartment() != null) {
                        user.getDepartment().getId();
                    }
                    if (user.getTeam() != null) {
                        user.getTeam().getId();
                    }
                });
            }
        });
        
        // Ensure current user's relationships are accessible
        if (currentUser.getDepartment() != null) {
            currentUser.getDepartment().getId();
        }
        if (currentUser.getTeam() != null) {
            currentUser.getTeam().getId();
        }
        
        // Filter goals based on RBAC rules using canUserViewGoal
        return allGoals.stream()
                .filter(goal -> {
                    // First check if user can view the goal based on RBAC rules
                    if (!canUserViewGoal(currentUser, goal)) {
                        return false;
                    }
                    
                    // Then apply confidential goal filtering: only show if user is owner or assigned
                    if (goal.getConfidential() != null && goal.getConfidential()) {
                        boolean isOwner = goal.getOwner() != null && 
                                         Objects.equals(goal.getOwner().getId(), currentUser.getId());
                        boolean isAssigned = goal.getAssignedUsers() != null && 
                                           goal.getAssignedUsers().stream()
                                                   .anyMatch(user -> Objects.equals(user.getId(), currentUser.getId()));
                        return isOwner || isAssigned;
                    }
                    
                    // Non-confidential goal that passed RBAC check
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
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return List.of(); // No user logged in, return empty list
        }
        
        // Fetch goals by owner
        List<Goal> goals = goalRepository.findByOwnerEmailAndTenantId(email, tenantId);
        
        // Ensure lazy-loaded relationships are accessible within transaction
        goals.forEach(goal -> {
            if (goal.getOwner() != null) {
                goal.getOwner().getId();
                if (goal.getOwner().getDepartment() != null) {
                    goal.getOwner().getDepartment().getId();
                }
                if (goal.getOwner().getTeam() != null) {
                    goal.getOwner().getTeam().getId();
                }
            }
            if (goal.getAssignedUsers() != null) {
                goal.getAssignedUsers().forEach(user -> {
                    user.getId();
                    if (user.getDepartment() != null) {
                        user.getDepartment().getId();
                    }
                    if (user.getTeam() != null) {
                        user.getTeam().getId();
                    }
                });
            }
        });
        
        // Ensure current user's relationships are accessible
        if (currentUser.getDepartment() != null) {
            currentUser.getDepartment().getId();
        }
        if (currentUser.getTeam() != null) {
            currentUser.getTeam().getId();
        }
        
        // Filter goals based on RBAC rules - only return goals the user can view
        return goals.stream()
                .filter(goal -> canUserViewGoal(currentUser, goal))
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
        
        // KPI validation removed - KPIs are now optional for goal assignment
        
        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate that the user being assigned is either:
        // 1. The goal owner
        // 2. A member of the goal owner's department
        // 3. A member of a team where the goal owner is the team lead
        User goalOwner = goal.getOwner();
        boolean isOwner = Objects.equals(user.getId(), goalOwner.getId());
        boolean isInOwnerDepartment = false;
        boolean isTeamMemberOfOwner = false;
        
        if (!isOwner && goalOwner.getDepartment() != null) {
            Department ownerDepartment = goalOwner.getDepartment();
            if (user.getDepartment() != null) {
                isInOwnerDepartment = Objects.equals(user.getDepartment().getId(), ownerDepartment.getId());
            }
        }
        
        // Check if goal owner is team lead of user's team
        if (!isOwner && user.getTeam() != null && user.getTeam().getTeamLead() != null) {
            isTeamMemberOfOwner = Objects.equals(user.getTeam().getTeamLead().getId(), goalOwner.getId());
        }
        
        if (!isOwner && !isInOwnerDepartment && !isTeamMemberOfOwner) {
            throw new IllegalStateException(
                "Goals can only be assigned to: " +
                "1. The goal owner, " +
                "2. Members of the goal owner's department, or " +
                "3. Members of a team where the goal owner is the team lead. " +
                "The user you are trying to assign does not meet any of these criteria."
            );
        }

        // Check if approval is needed
        // Approval is NOT needed if:
        // 1. Goal owner is the user being assigned (self-assignment)
        // 2. Goal owner is department manager or assistant
        // 3. Goal owner is team lead of user's team
        boolean needsApproval = true;
        
        if (isOwner) {
            // Self-assignment doesn't need approval
            needsApproval = false;
        } else {
            // Check if goal owner is department manager or assistant
            Department userDepartment = user.getDepartment();
            if (userDepartment != null) {
                User departmentManager = userDepartment.getManager();
                User managerAssistant = userDepartment.getManagerAssistant();
                
                boolean isManagerOrAssistant = (departmentManager != null && Objects.equals(departmentManager.getId(), goalOwner.getId())) ||
                                              (managerAssistant != null && Objects.equals(managerAssistant.getId(), goalOwner.getId()));
                
                if (isManagerOrAssistant) {
                    needsApproval = false;
                }
            }
            
            // Check if goal owner is team lead
            if (needsApproval && isTeamMemberOfOwner) {
                needsApproval = false;
            }
        }
        
        // If approval is needed, set status to PENDING_APPROVAL
        if (needsApproval) {
            goal.setStatus(Goal.GoalStatus.PENDING_APPROVAL);
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
        
        // Include territory information
        if (goal.getTerritory() != null) {
            dto.setTerritoryId(goal.getTerritory().getId());
            dto.setTerritoryName(goal.getTerritory().getName());
        }
        
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
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        // Validate department exists
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        // Verify user is the department manager
        if (department.getManager() == null || 
            !Objects.equals(department.getManager().getId(), currentUser.getId())) {
            throw new IllegalStateException("Only the department manager can view pending approval goals");
        }
        
        return goalRepository.findAllByTenantId(tenantId).stream()
                .filter(goal -> goal.getStatus() == Goal.GoalStatus.PENDING_APPROVAL)
                .filter(goal -> goal.getAssignedUsers() != null &&
                        goal.getAssignedUsers().stream()
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
        
        // Get current logged-in user
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        // Validate department exists
        Department department = departmentRepository.findByIdAndTenantId(departmentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        
        // Verify user is the department manager
        if (department.getManager() == null || 
            !Objects.equals(department.getManager().getId(), currentUser.getId())) {
            throw new IllegalStateException("Only the department manager can view department members' goals");
        }
        
        return goalRepository.findAllByTenantId(tenantId).stream()
                .filter(goal -> {
                    // Check if goal owner is in the department
                    boolean ownerInDepartment = goal.getOwner() != null && 
                                              goal.getOwner().getDepartment() != null &&
                                              Objects.equals(goal.getOwner().getDepartment().getId(), departmentId);
                    
                    // Check if any assigned user is in the department
                    boolean assignedUserInDepartment = goal.getAssignedUsers() != null &&
                                                      goal.getAssignedUsers().stream()
                                                              .anyMatch(user -> user.getDepartment() != null && 
                                                                      Objects.equals(user.getDepartment().getId(), departmentId));
                    
                    return ownerInDepartment || assignedUserInDepartment;
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
