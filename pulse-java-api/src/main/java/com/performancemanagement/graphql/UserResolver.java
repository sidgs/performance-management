package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.Team;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.TeamRepository;
import com.performancemanagement.repository.UserRepository;
import com.performancemanagement.service.UserService;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class UserResolver implements GraphQLResolver<User> {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserService userService;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId(); // Returns null if no tenant context - tenant validation is disabled
    }

    @Transactional(readOnly = true)
    public Department department(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return department if available
            Department dept = user.getDepartment();
            if (dept != null) {
                Hibernate.initialize(dept);
                Hibernate.initialize(dept.getTenant());
            }
            return dept;
        }
        Department dept = user.getDepartment();
        if (dept != null) {
            Hibernate.initialize(dept);
            Hibernate.initialize(dept.getTenant());
            if (dept.getTenant().getFqdn().equals(tenantId)) {
                return dept;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public Team team(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return team if available
            Team team = user.getTeam();
            if (team != null) {
                Hibernate.initialize(team);
                Hibernate.initialize(team.getTenant());
            }
            return team;
        }
        Team team = user.getTeam();
        if (team != null) {
            Hibernate.initialize(team);
            Hibernate.initialize(team.getTenant());
            if (team.getTenant().getFqdn().equals(tenantId)) {
                return team;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User manager(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return manager if available
            User manager = user.getManager();
            if (manager != null) {
                Hibernate.initialize(manager);
                Hibernate.initialize(manager.getTenant());
            }
            return manager;
        }
        User manager = user.getManager();
        if (manager != null) {
            Hibernate.initialize(manager);
            Hibernate.initialize(manager.getTenant());
            if (manager.getTenant().getFqdn().equals(tenantId)) {
                return manager;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User effectiveManager(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        // Use UserService to compute effective manager
        User effectiveManager = userService.getEffectiveManager(user);
        if (effectiveManager != null) {
            String tenantId = getCurrentTenantId();
            if (tenantId == null || effectiveManager.getTenant().getFqdn().equals(tenantId)) {
                Hibernate.initialize(effectiveManager);
                Hibernate.initialize(effectiveManager.getTenant());
                return effectiveManager;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<User> teamMembers(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        Hibernate.initialize(user.getTeamMembers());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all team members
            return user.getTeamMembers().stream()
                    .peek(member -> {
                        Hibernate.initialize(member);
                        Hibernate.initialize(member.getTenant());
                    })
                    .toList();
        }
        return user.getTeamMembers().stream()
                .peek(member -> {
                    Hibernate.initialize(member);
                    Hibernate.initialize(member.getTenant());
                })
                .filter(member -> member.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Goal> assignedGoals(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        Hibernate.initialize(user.getAssignedGoals());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all assigned goals
            return user.getAssignedGoals().stream()
                    .peek(goal -> {
                        Hibernate.initialize(goal);
                        Hibernate.initialize(goal.getTenant());
                    })
                    .toList();
        }
        return user.getAssignedGoals().stream()
                .peek(goal -> {
                    Hibernate.initialize(goal);
                    Hibernate.initialize(goal.getTenant());
                })
                .filter(goal -> goal.getTenant().getFqdn().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Goal> ownedGoals(User user) {
        // Re-attach the entity to the current session
        user = entityManager.merge(user);
        Hibernate.initialize(user.getOwnedGoals());
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            // Tenant validation disabled - return all owned goals
            return user.getOwnedGoals().stream()
                    .peek(goal -> {
                        Hibernate.initialize(goal);
                        Hibernate.initialize(goal.getTenant());
                    })
                    .toList();
        }
        return user.getOwnedGoals().stream()
                .peek(goal -> {
                    Hibernate.initialize(goal);
                    Hibernate.initialize(goal.getTenant());
                })
                .filter(goal -> goal.getTenant().getFqdn().equals(tenantId))
                .toList();
    }
}
