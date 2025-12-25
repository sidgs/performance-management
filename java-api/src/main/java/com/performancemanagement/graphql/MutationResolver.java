package com.performancemanagement.graphql;

import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.KPIRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.DepartmentService;
import com.performancemanagement.service.GoalService;
import com.performancemanagement.service.KPIService;
import com.performancemanagement.service.UserService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class MutationResolver implements GraphQLMutationResolver {

    @Autowired
    private UserService userService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private com.performancemanagement.service.BulkUploadService bulkUploadService;

    @Autowired
    private KPIService kpiService;

    @Autowired
    private KPIRepository kpiRepository;

    // User mutations
    public User createUser(UserInput input) {
        authorizationService.requireEpmAdmin();
        var userDTO = new com.performancemanagement.dto.UserDTO();
        userDTO.setFirstName(input.getFirstName());
        userDTO.setLastName(input.getLastName());
        userDTO.setEmail(input.getEmail());
        userDTO.setTitle(input.getTitle());
        userDTO.setManagerId(input.getManagerId());
        
        var created = userService.createUser(userDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return userRepository.findByIdAndTenantId(created.getId(), tenantId).orElse(null);
    }

    public User updateUser(Long id, UserInput input) {
        authorizationService.requireEpmAdmin();
        var userDTO = new com.performancemanagement.dto.UserDTO();
        userDTO.setFirstName(input.getFirstName());
        userDTO.setLastName(input.getLastName());
        userDTO.setEmail(input.getEmail());
        userDTO.setTitle(input.getTitle());
        userDTO.setManagerId(input.getManagerId());
        
        var updated = userService.updateUser(id, userDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return userRepository.findByIdAndTenantId(updated.getId(), tenantId).orElse(null);
    }

    public Boolean deleteUser(Long id) {
        try {
            authorizationService.requireEpmAdmin();
            userService.deleteUser(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public User setUserManager(Long userId, Long managerId) {
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        
        // Get current user
        String currentUserEmail = authorizationService.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        User targetUser = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // If setting a manager (not removing)
        if (managerId != null) {
            User manager = userRepository.findByIdAndTenantId(managerId, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            
            // Check if current user is the manager being set, or if current user is EPM_ADMIN
            boolean isEpmAdmin = authorizationService.isEpmAdmin();
            boolean isSettingSelfAsManager = manager.getEmail().equalsIgnoreCase(currentUserEmail);
            
            if (!isEpmAdmin && !isSettingSelfAsManager) {
                throw new IllegalStateException("You can only set yourself as a manager for other users");
            }
            
            // Check if user already has a different manager
            if (targetUser.getManager() != null && 
                !targetUser.getManager().getId().equals(managerId) &&
                !isEpmAdmin) {
                throw new IllegalStateException("User already has a manager. Only EPM_ADMIN can change existing manager relationships.");
            }
            
            targetUser.setManager(manager);
        } else {
            // Removing manager - only allowed if current user is the manager or EPM_ADMIN
            boolean isEpmAdmin = authorizationService.isEpmAdmin();
            boolean isCurrentUserTheManager = targetUser.getManager() != null && 
                targetUser.getManager().getEmail().equalsIgnoreCase(currentUserEmail);
            
            if (!isEpmAdmin && !isCurrentUserTheManager) {
                throw new IllegalStateException("You can only remove yourself as a manager");
            }
            
            targetUser.setManager(null);
        }
        
        User savedUser = userRepository.save(targetUser);
        return savedUser;
    }

    // Goal mutations
    public Goal createGoal(GoalInput input) {
        var goalDTO = new com.performancemanagement.dto.GoalDTO();
        goalDTO.setShortDescription(input.getShortDescription());
        goalDTO.setLongDescription(input.getLongDescription());
        goalDTO.setOwnerEmail(input.getOwnerEmail());
        goalDTO.setStatus(input.getStatus());
        goalDTO.setConfidential(input.getConfidential() != null ? input.getConfidential() : false);
        
        if (input.getCreationDate() != null) {
            goalDTO.setCreationDate(LocalDate.parse(input.getCreationDate()));
        }
        if (input.getCompletionDate() != null) {
            goalDTO.setCompletionDate(LocalDate.parse(input.getCompletionDate()));
        }
        if (input.getTargetCompletionDate() != null) {
            goalDTO.setTargetCompletionDate(LocalDate.parse(input.getTargetCompletionDate()));
        }
        goalDTO.setParentGoalId(input.getParentGoalId());
        
        // Convert KPI inputs to DTOs
        if (input.getKpis() != null && !input.getKpis().isEmpty()) {
            List<com.performancemanagement.dto.KPIDTO> kpiDTOs = input.getKpis().stream().map(kpiInput -> {
                var kpiDTO = new com.performancemanagement.dto.KPIDTO();
                kpiDTO.setDescription(kpiInput.getDescription());
                kpiDTO.setDueDate(LocalDate.parse(kpiInput.getDueDate()));
                kpiDTO.setStatus(kpiInput.getStatus());
                kpiDTO.setCompletionPercentage(kpiInput.getCompletionPercentage() != null ? kpiInput.getCompletionPercentage() : 0);
                return kpiDTO;
            }).toList();
            goalDTO.setKpis(kpiDTOs);
        }
        
        var created = goalService.createGoal(goalDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(created.getId(), tenantId).orElse(null);
    }

    public Goal updateGoal(Long id, GoalInput input) {
        var goalDTO = new com.performancemanagement.dto.GoalDTO();
        goalDTO.setShortDescription(input.getShortDescription());
        goalDTO.setLongDescription(input.getLongDescription());
        goalDTO.setStatus(input.getStatus());
        if (input.getConfidential() != null) {
            goalDTO.setConfidential(input.getConfidential());
        }
        
        if (input.getCompletionDate() != null) {
            goalDTO.setCompletionDate(LocalDate.parse(input.getCompletionDate()));
        }
        if (input.getTargetCompletionDate() != null) {
            goalDTO.setTargetCompletionDate(LocalDate.parse(input.getTargetCompletionDate()));
        }
        goalDTO.setParentGoalId(input.getParentGoalId());
        
        var updated = goalService.updateGoal(id, goalDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(updated.getId(), tenantId).orElse(null);
    }

    public Goal assignGoalToUser(Long goalId, String userEmail) {
        var goalDTO = goalService.assignGoalToUser(goalId, userEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    public Goal unassignGoalFromUser(Long goalId, String userEmail) {
        var goalDTO = goalService.unassignGoalFromUser(goalId, userEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    public Goal lockGoal(Long id) {
        var goalDTO = goalService.lockGoal(id);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    public Goal unlockGoal(Long id) {
        // Get current user email from security context
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        String currentUserEmail;
        if (authentication.getPrincipal() instanceof com.performancemanagement.config.JwtTokenProvider.JwtUserDetails) {
            currentUserEmail = ((com.performancemanagement.config.JwtTokenProvider.JwtUserDetails) authentication.getPrincipal()).getEmail();
        } else {
            currentUserEmail = authentication.getName();
        }
        var goalDTO = goalService.unlockGoal(id, currentUserEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    public Boolean deleteGoal(Long id) {
        try {
            goalService.deleteGoal(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Goal updateTargetCompletionDate(Long goalId, String targetCompletionDate) {
        var goalDTO = goalService.updateTargetCompletionDate(
            goalId, 
            targetCompletionDate != null ? LocalDate.parse(targetCompletionDate) : null
        );
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    public Goal approveGoal(Long goalId) {
        var goalDTO = goalService.approveGoal(goalId);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return goalRepository.findByIdAndTenantId(goalDTO.getId(), tenantId).orElse(null);
    }

    // KPI mutations
    public KPI createKPI(Long goalId, KPIInput input) {
        var kpiDTO = new com.performancemanagement.dto.KPIDTO();
        kpiDTO.setDescription(input.getDescription());
        kpiDTO.setDueDate(LocalDate.parse(input.getDueDate()));
        kpiDTO.setStatus(input.getStatus() != null ? input.getStatus() : KPI.KPIStatus.NOT_STARTED);
        kpiDTO.setCompletionPercentage(input.getCompletionPercentage() != null ? input.getCompletionPercentage() : 0);
        
        var created = kpiService.createKPI(goalId, kpiDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return kpiRepository.findByIdAndTenantId(created.getId(), tenantId).orElse(null);
    }

    public KPI updateKPI(Long id, KPIUpdateInput input) {
        var kpiDTO = new com.performancemanagement.dto.KPIDTO();
        kpiDTO.setDescription(input.getDescription());
        kpiDTO.setStatus(input.getStatus());
        kpiDTO.setCompletionPercentage(input.getCompletionPercentage());
        if (input.getDueDate() != null) {
            kpiDTO.setDueDate(LocalDate.parse(input.getDueDate()));
        }
        
        var updated = kpiService.updateKPI(id, kpiDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return kpiRepository.findByIdAndTenantId(updated.getId(), tenantId).orElse(null);
    }

    public Boolean deleteKPI(Long id) {
        try {
            kpiService.deleteKPI(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Department mutations
    public Department createDepartment(DepartmentInput input) {
        authorizationService.requireHrAdmin();
        var deptDTO = new com.performancemanagement.dto.DepartmentDTO();
        deptDTO.setName(input.getName());
        deptDTO.setSmallDescription(input.getSmallDescription());
        deptDTO.setManagerEmail(input.getManagerEmail());
        deptDTO.setManagerAssistantEmail(input.getManagerAssistantEmail());
        deptDTO.setCoOwnerEmail(input.getCoOwnerEmail());
        deptDTO.setStatus(input.getStatus());
        
        if (input.getCreationDate() != null) {
            deptDTO.setCreationDate(LocalDate.parse(input.getCreationDate()));
        }
        deptDTO.setParentDepartmentId(input.getParentDepartmentId());
        
        var created = departmentService.createDepartment(deptDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(created.getId(), tenantId).orElse(null);
    }

    public Department updateDepartment(Long id, DepartmentInput input) {
        authorizationService.requireHrAdmin();
        var deptDTO = new com.performancemanagement.dto.DepartmentDTO();
        deptDTO.setName(input.getName());
        deptDTO.setSmallDescription(input.getSmallDescription());
        deptDTO.setManagerAssistantEmail(input.getManagerAssistantEmail());
        deptDTO.setCoOwnerEmail(input.getCoOwnerEmail());
        deptDTO.setStatus(input.getStatus());
        deptDTO.setParentDepartmentId(input.getParentDepartmentId());
        
        var updated = departmentService.updateDepartment(id, deptDTO);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(updated.getId(), tenantId).orElse(null);
    }

    public Department assignUserToDepartment(Long departmentId, String userEmail) {
        authorizationService.requireHrAdmin();
        var deptDTO = departmentService.assignUserToDepartment(departmentId, userEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(deptDTO.getId(), tenantId).orElse(null);
    }

    public Boolean deleteDepartment(Long id) {
        try {
            authorizationService.requireHrAdmin();
            departmentService.deleteDepartment(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Department setDepartmentManager(Long departmentId, String userEmail) {
        authorizationService.requireHrAdmin();
        var deptDTO = departmentService.setDepartmentManager(departmentId, userEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(deptDTO.getId(), tenantId).orElse(null);
    }

    public Department assignManagerAssistant(Long departmentId, String userEmail) {
        authorizationService.requireDepartmentManager(departmentId);
        var deptDTO = departmentService.assignManagerAssistant(departmentId, userEmail);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(deptDTO.getId(), tenantId).orElse(null);
    }

    public Department moveUserToDepartment(Long userId, Long departmentId) {
        authorizationService.requireHrAdmin();
        var deptDTO = departmentService.moveUserToDepartment(userId, departmentId);
        String tenantId = com.performancemanagement.config.TenantContext.getCurrentTenantId();
        return departmentRepository.findByIdAndTenantId(deptDTO.getId(), tenantId).orElse(null);
    }

    // Bulk upload mutation
    public com.performancemanagement.dto.BulkUploadDTO.BulkUploadResult bulkUploadUsers(String csvData) {
        authorizationService.requireEpmAdmin();
        
        // Parse CSV
        List<com.performancemanagement.dto.BulkUploadDTO.BulkUploadRow> rows = bulkUploadService.parseCSV(csvData);
        
        // Process bulk upload
        return bulkUploadService.processBulkUpload(rows);
    }

    // Inner classes for GraphQL input types
    public static class UserInput {
        private String firstName;
        private String lastName;
        private String email;
        private String title;
        private Long managerId;
        private Long departmentId;

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    }

    public static class GoalInput {
        private String shortDescription;
        private String longDescription;
        private String ownerEmail;
        private String creationDate;
        private String completionDate;
        private String assignedDate;
        private String targetCompletionDate;
        private Goal.GoalStatus status;
        private Long parentGoalId;
        private Boolean confidential;
        private List<KPIInput> kpis;

        // Getters and setters
        public String getShortDescription() { return shortDescription; }
        public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
        public String getLongDescription() { return longDescription; }
        public void setLongDescription(String longDescription) { this.longDescription = longDescription; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
        public String getCreationDate() { return creationDate; }
        public void setCreationDate(String creationDate) { this.creationDate = creationDate; }
        public String getCompletionDate() { return completionDate; }
        public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }
        public String getAssignedDate() { return assignedDate; }
        public void setAssignedDate(String assignedDate) { this.assignedDate = assignedDate; }
        public String getTargetCompletionDate() { return targetCompletionDate; }
        public void setTargetCompletionDate(String targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }
        public Goal.GoalStatus getStatus() { return status; }
        public void setStatus(Goal.GoalStatus status) { this.status = status; }
        public Long getParentGoalId() { return parentGoalId; }
        public void setParentGoalId(Long parentGoalId) { this.parentGoalId = parentGoalId; }
        public Boolean getConfidential() { return confidential; }
        public void setConfidential(Boolean confidential) { this.confidential = confidential; }
        public List<KPIInput> getKpis() { return kpis; }
        public void setKpis(List<KPIInput> kpis) { this.kpis = kpis; }
    }

    public static class KPIInput {
        private String description;
        private KPI.KPIStatus status;
        private Integer completionPercentage;
        private String dueDate;

        // Getters and setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public KPI.KPIStatus getStatus() { return status; }
        public void setStatus(KPI.KPIStatus status) { this.status = status; }
        public Integer getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    }

    public static class KPIUpdateInput {
        private String description;
        private KPI.KPIStatus status;
        private Integer completionPercentage;
        private String dueDate;

        // Getters and setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public KPI.KPIStatus getStatus() { return status; }
        public void setStatus(KPI.KPIStatus status) { this.status = status; }
        public Integer getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    }

    public static class DepartmentInput {
        private String name;
        private String smallDescription;
        private String managerEmail;
        private String managerAssistantEmail;
        private String coOwnerEmail;
        private String creationDate;
        private Department.DepartmentStatus status;
        private Long parentDepartmentId;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSmallDescription() { return smallDescription; }
        public void setSmallDescription(String smallDescription) { this.smallDescription = smallDescription; }
        public String getManagerEmail() { return managerEmail; }
        public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
        public String getManagerAssistantEmail() { return managerAssistantEmail; }
        public void setManagerAssistantEmail(String managerAssistantEmail) { this.managerAssistantEmail = managerAssistantEmail; }
        public String getCoOwnerEmail() { return coOwnerEmail; }
        public void setCoOwnerEmail(String coOwnerEmail) { this.coOwnerEmail = coOwnerEmail; }
        public String getCreationDate() { return creationDate; }
        public void setCreationDate(String creationDate) { this.creationDate = creationDate; }
        public Department.DepartmentStatus getStatus() { return status; }
        public void setStatus(Department.DepartmentStatus status) { this.status = status; }
        public Long getParentDepartmentId() { return parentDepartmentId; }
        public void setParentDepartmentId(Long parentDepartmentId) { this.parentDepartmentId = parentDepartmentId; }
    }
}
