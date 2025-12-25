package com.performancemanagement.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.performancemanagement.model.*;
import com.performancemanagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Order(100) // Run after database initialization
@org.springframework.context.annotation.Profile("demo")
public class DemoDataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataLoader.class);

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private KPIRepository kpiRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Read tenant FQDN from environment variable, default to "localhost"
            String tenantFqdn = System.getenv("DEMO_TENANT_FQDN");
            if (tenantFqdn == null || tenantFqdn.trim().isEmpty()) {
                tenantFqdn = "localhost";
            }
            tenantFqdn = tenantFqdn.trim();

            logger.info("Demo data loader starting for tenant FQDN: {}", tenantFqdn);

            // Check if tenant already exists
            Optional<Tenant> existingTenant = tenantRepository.findByFqdn(tenantFqdn);
            if (existingTenant.isPresent()) {
                logger.info("Tenant with FQDN '{}' already exists. Skipping demo data loading.", tenantFqdn);
                return;
            }

            // Load JSON data
            ObjectMapper objectMapper = new ObjectMapper();
            ClassPathResource resource = new ClassPathResource("demo-data.json");
            DemoData demoData;
            try (InputStream inputStream = resource.getInputStream()) {
                demoData = objectMapper.readValue(inputStream, DemoData.class);
            }

            // Override tenant FQDN from JSON with environment variable value
            demoData.tenant.fqdn = tenantFqdn;

            logger.info("Loading demo data for tenant: {}", demoData.tenant.name);

            // Set tenant context
            Tenant tenant = createTenant(demoData.tenant);
            TenantContext.setCurrentTenant(tenant);

            // Phase 1: Create all users (without manager relationships)
            Map<String, User> userMap = createUsers(demoData.users, tenant);

            // Phase 2: Set manager relationships
            setManagerRelationships(demoData.users, userMap);

            // Phase 3: Create departments
            Map<String, Department> departmentMap = createDepartments(demoData.departments, tenant, userMap);

            // Phase 4: Assign users to departments
            assignUsersToDepartments(demoData.departments, userMap, departmentMap);

            // Phase 5: Create goals (root goals first, then children)
            Map<String, Goal> goalMap = createGoals(demoData.goals, tenant, userMap, departmentMap);

            // Phase 6: Assign goals to users
            assignGoalsToUsers(demoData.goals, userMap, goalMap);

            // Phase 7: Create KPIs
            createKPIs(demoData.goals, tenant, goalMap);

            logger.info("Demo data loading completed successfully for tenant: {}", tenantFqdn);
        } catch (Exception e) {
            logger.error("Failed to load demo data", e);
            // Don't fail application startup
        }
    }

    private Tenant createTenant(DemoData.TenantData tenantData) {
        Tenant tenant = new Tenant();
        tenant.setFqdn(tenantData.fqdn);
        tenant.setName(tenantData.name);
        tenant.setActive(tenantData.active);
        return tenantRepository.save(tenant);
    }

    private Map<String, User> createUsers(List<DemoData.UserData> usersData, Tenant tenant) {
        Map<String, User> userMap = new HashMap<>();
        for (DemoData.UserData userData : usersData) {
            User user = new User();
            user.setTenant(tenant);
            user.setFirstName(userData.firstName);
            user.setLastName(userData.lastName);
            user.setEmail(userData.email);
            user.setTitle(userData.title);
            user.setRole(User.Role.valueOf(userData.role));
            user = userRepository.save(user);
            userMap.put(userData.email, user);
            logger.debug("Created user: {}", userData.email);
        }
        return userMap;
    }

    private void setManagerRelationships(List<DemoData.UserData> usersData, Map<String, User> userMap) {
        for (DemoData.UserData userData : usersData) {
            if (userData.managerEmail != null && !userData.managerEmail.isEmpty()) {
                User user = userMap.get(userData.email);
                User manager = userMap.get(userData.managerEmail);
                if (user != null && manager != null) {
                    user.setManager(manager);
                    userRepository.save(user);
                    logger.debug("Set manager {} for user {}", userData.managerEmail, userData.email);
                } else {
                    logger.warn("Could not set manager relationship: user={}, manager={}", 
                        userData.email, userData.managerEmail);
                }
            }
        }
    }

    private Map<String, Department> createDepartments(
            List<DemoData.DepartmentData> departmentsData, 
            Tenant tenant, 
            Map<String, User> userMap) {
        Map<String, Department> departmentMap = new HashMap<>();
        
        // First pass: Create departments without parent relationships
        for (DemoData.DepartmentData deptData : departmentsData) {
            Department department = new Department();
            department.setTenant(tenant);
            department.setName(deptData.name);
            department.setSmallDescription(deptData.smallDescription);
            department.setCreationDate(LocalDate.parse(deptData.creationDate));
            department.setStatus(Department.DepartmentStatus.valueOf(deptData.status));
            
            // Set manager
            User manager = userMap.get(deptData.managerEmail);
            if (manager != null) {
                department.setManager(manager);
            } else {
                logger.warn("Manager not found for department {}: {}", deptData.name, deptData.managerEmail);
            }
            
            // Set manager assistant (optional)
            if (deptData.managerAssistantEmail != null && !deptData.managerAssistantEmail.isEmpty()) {
                User assistant = userMap.get(deptData.managerAssistantEmail);
                if (assistant != null) {
                    department.setManagerAssistant(assistant);
                }
            }
            
            // Set co-owner (optional)
            if (deptData.coOwnerEmail != null && !deptData.coOwnerEmail.isEmpty()) {
                User coOwner = userMap.get(deptData.coOwnerEmail);
                if (coOwner != null) {
                    department.setCoOwner(coOwner);
                }
            }
            
            department = departmentRepository.save(department);
            departmentMap.put(deptData.name, department);
            logger.debug("Created department: {}", deptData.name);
        }
        
        // Second pass: Set parent department relationships
        for (DemoData.DepartmentData deptData : departmentsData) {
            if (deptData.parentDepartmentName != null && !deptData.parentDepartmentName.isEmpty()) {
                Department department = departmentMap.get(deptData.name);
                Department parentDepartment = departmentMap.get(deptData.parentDepartmentName);
                if (department != null && parentDepartment != null) {
                    department.setParentDepartment(parentDepartment);
                    departmentRepository.save(department);
                    logger.debug("Set parent department {} for department {}", 
                        deptData.parentDepartmentName, deptData.name);
                }
            }
        }
        
        return departmentMap;
    }

    private void assignUsersToDepartments(
            List<DemoData.DepartmentData> departmentsData,
            Map<String, User> userMap,
            Map<String, Department> departmentMap) {
        // Note: The JSON structure doesn't explicitly list which users belong to which departments.
        // We'll assign users based on their manager's department.
        // Strategy:
        // 1. If user's manager is a department manager, assign user to that department
        // 2. Otherwise, if user's manager has a department, assign user to the same department
        
        for (User user : userMap.values()) {
            if (user.getManager() != null) {
                // First, check if manager is a department manager
                Department managerDepartment = null;
                for (Department dept : departmentMap.values()) {
                    if (dept.getManager() != null && dept.getManager().getId().equals(user.getManager().getId())) {
                        managerDepartment = dept;
                        break;
                    }
                }
                
                // If manager is a department manager, assign user to that department
                if (managerDepartment != null) {
                    user.setDepartment(managerDepartment);
                    userRepository.save(user);
                    logger.debug("Assigned user {} to department {} (manager is dept manager)", 
                        user.getEmail(), managerDepartment.getName());
                } else if (user.getManager().getDepartment() != null) {
                    // Otherwise, assign to the same department as manager
                    user.setDepartment(user.getManager().getDepartment());
                    userRepository.save(user);
                    logger.debug("Assigned user {} to department {} (same as manager)", 
                        user.getEmail(), user.getManager().getDepartment().getName());
                }
            }
        }
    }

    private Map<String, Goal> createGoals(
            List<DemoData.GoalData> goalsData,
            Tenant tenant,
            Map<String, User> userMap,
            Map<String, Department> departmentMap) {
        Map<String, Goal> goalMap = new HashMap<>();
        
        // First pass: Create root goals (goals without parents)
        List<DemoData.GoalData> rootGoals = goalsData.stream()
            .filter(g -> g.parentGoalShortDescription == null || g.parentGoalShortDescription.isEmpty())
            .collect(Collectors.toList());
        
        for (DemoData.GoalData goalData : rootGoals) {
            Goal goal = createGoal(goalData, tenant, userMap, null);
            goal = goalRepository.save(goal);
            goalMap.put(goalData.shortDescription, goal);
            logger.debug("Created root goal: {}", goalData.shortDescription);
        }
        
        // Second pass: Create child goals
        List<DemoData.GoalData> childGoals = goalsData.stream()
            .filter(g -> g.parentGoalShortDescription != null && !g.parentGoalShortDescription.isEmpty())
            .collect(Collectors.toList());
        
        for (DemoData.GoalData goalData : childGoals) {
            Goal parentGoal = goalMap.get(goalData.parentGoalShortDescription);
            if (parentGoal != null) {
                Goal goal = createGoal(goalData, tenant, userMap, parentGoal);
                goal = goalRepository.save(goal);
                goalMap.put(goalData.shortDescription, goal);
                logger.debug("Created child goal: {} (parent: {})", 
                    goalData.shortDescription, goalData.parentGoalShortDescription);
            } else {
                logger.warn("Parent goal not found for goal {}: {}", 
                    goalData.shortDescription, goalData.parentGoalShortDescription);
            }
        }
        
        return goalMap;
    }

    private Goal createGoal(
            DemoData.GoalData goalData,
            Tenant tenant,
            Map<String, User> userMap,
            Goal parentGoal) {
        Goal goal = new Goal();
        goal.setTenant(tenant);
        goal.setShortDescription(goalData.shortDescription);
        goal.setLongDescription(goalData.longDescription);
        goal.setCreationDate(LocalDate.parse(goalData.creationDate));
        goal.setStatus(Goal.GoalStatus.valueOf(goalData.status));
        
        if (goalData.targetCompletionDate != null && !goalData.targetCompletionDate.isEmpty()) {
            goal.setTargetCompletionDate(LocalDate.parse(goalData.targetCompletionDate));
        }
        
        User owner = userMap.get(goalData.ownerEmail);
        if (owner != null) {
            goal.setOwner(owner);
        } else {
            logger.warn("Owner not found for goal {}: {}", goalData.shortDescription, goalData.ownerEmail);
        }
        
        if (parentGoal != null) {
            goal.setParentGoal(parentGoal);
        }
        
        return goal;
    }

    private void assignGoalsToUsers(
            List<DemoData.GoalData> goalsData,
            Map<String, User> userMap,
            Map<String, Goal> goalMap) {
        for (DemoData.GoalData goalData : goalsData) {
            Goal goal = goalMap.get(goalData.shortDescription);
            if (goal != null && goalData.assignedUserEmails != null) {
                for (String email : goalData.assignedUserEmails) {
                    User user = userMap.get(email);
                    if (user != null) {
                        goal.getAssignedUsers().add(user);
                        logger.debug("Assigned goal {} to user {}", goalData.shortDescription, email);
                    }
                }
                goalRepository.save(goal);
            }
        }
    }

    private void createKPIs(
            List<DemoData.GoalData> goalsData,
            Tenant tenant,
            Map<String, Goal> goalMap) {
        for (DemoData.GoalData goalData : goalsData) {
            Goal goal = goalMap.get(goalData.shortDescription);
            if (goal != null && goalData.kpis != null) {
                for (DemoData.KPIData kpiData : goalData.kpis) {
                    KPI kpi = new KPI();
                    kpi.setTenant(tenant);
                    kpi.setGoal(goal);
                    kpi.setDescription(kpiData.description);
                    kpi.setStatus(KPI.KPIStatus.valueOf(kpiData.status));
                    kpi.setCompletionPercentage(kpiData.completionPercentage);
                    kpi.setDueDate(LocalDate.parse(kpiData.dueDate));
                    kpiRepository.save(kpi);
                    logger.debug("Created KPI for goal {}: {}", goalData.shortDescription, kpiData.description);
                }
            }
        }
    }

    // Inner classes for JSON deserialization
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class DemoData {
        public TenantData tenant;
        public List<UserData> users;
        public List<DepartmentData> departments;
        public List<GoalData> goals;

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class TenantData {
            public String fqdn;
            public String name;
            public Boolean active;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class UserData {
            public String firstName;
            public String lastName;
            public String email;
            public String title;
            public String role;
            @JsonProperty("managerEmail")
            public String managerEmail;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class DepartmentData {
            public String name;
            @JsonProperty("smallDescription")
            public String smallDescription;
            @JsonProperty("managerEmail")
            public String managerEmail;
            @JsonProperty("managerAssistantEmail")
            public String managerAssistantEmail;
            @JsonProperty("coOwnerEmail")
            public String coOwnerEmail;
            @JsonProperty("creationDate")
            public String creationDate;
            public String status;
            @JsonProperty("parentDepartmentName")
            public String parentDepartmentName;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class GoalData {
            @JsonProperty("shortDescription")
            public String shortDescription;
            @JsonProperty("longDescription")
            public String longDescription;
            @JsonProperty("ownerEmail")
            public String ownerEmail;
            @JsonProperty("creationDate")
            public String creationDate;
            @JsonProperty("targetCompletionDate")
            public String targetCompletionDate;
            public String status;
            @JsonProperty("assignedUserEmails")
            public List<String> assignedUserEmails;
            @JsonProperty("parentGoalShortDescription")
            public String parentGoalShortDescription;
            public List<KPIData> kpis;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class KPIData {
            public String description;
            public String status;
            @JsonProperty("completionPercentage")
            public Integer completionPercentage;
            @JsonProperty("dueDate")
            public String dueDate;
        }
    }
}
