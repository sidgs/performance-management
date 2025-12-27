package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.TeamDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.Team;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.TeamRepository;
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
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId();
    }

    private String requireTenantId() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required for this operation");
        }
        return tenantId;
    }

    @CacheEvict(value = {"teams", "team"}, allEntries = true)
    public TeamDTO createTeam(TeamDTO teamDTO) {
        String tenantId = requireTenantId();

        // Validate department exists
        Department department = departmentRepository.findByIdAndTenantId(teamDTO.getDepartmentId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        // Validate team lead exists and belongs to the same department
        User teamLead = userRepository.findByEmailAndTenantId(teamDTO.getTeamLeadEmail(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team lead not found"));

        if (teamLead.getDepartment() == null || !teamLead.getDepartment().getId().equals(department.getId())) {
            throw new IllegalArgumentException("Team lead must belong to the same department as the team");
        }

        // Check if team name already exists in this department
        teamRepository.findByNameAndDepartmentIdAndTenantId(teamDTO.getName(), department.getId(), tenantId)
                .ifPresent(existingTeam -> {
                    throw new IllegalArgumentException("Team with name '" + teamDTO.getName() + "' already exists in this department");
                });

        Team team = new Team();
        team.setTenant(TenantContext.getCurrentTenant());
        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());
        team.setDepartment(department);
        team.setTeamLead(teamLead);

        Team savedTeam = teamRepository.save(team);
        return convertToDTO(savedTeam);
    }

    @CacheEvict(value = {"teams", "team"}, allEntries = true)
    public TeamDTO updateTeam(Long id, TeamDTO teamDTO) {
        String tenantId = requireTenantId();

        Team team = teamRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        // Update name if provided
        if (teamDTO.getName() != null && !teamDTO.getName().trim().isEmpty()) {
            // Check if new name conflicts with existing team in same department
            if (!team.getName().equals(teamDTO.getName())) {
                teamRepository.findByNameAndDepartmentIdAndTenantId(teamDTO.getName(), team.getDepartment().getId(), tenantId)
                        .ifPresent(existingTeam -> {
                            if (!existingTeam.getId().equals(team.getId())) {
                                throw new IllegalArgumentException("Team with name '" + teamDTO.getName() + "' already exists in this department");
                            }
                        });
            }
            team.setName(teamDTO.getName());
        }

        // Update description if provided
        if (teamDTO.getDescription() != null) {
            team.setDescription(teamDTO.getDescription());
        }

        // Update team lead if provided
        if (teamDTO.getTeamLeadEmail() != null && !teamDTO.getTeamLeadEmail().trim().isEmpty()) {
            User newTeamLead = userRepository.findByEmailAndTenantId(teamDTO.getTeamLeadEmail(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Team lead not found"));

            // Validate new team lead belongs to same department
            if (newTeamLead.getDepartment() == null || !newTeamLead.getDepartment().getId().equals(team.getDepartment().getId())) {
                throw new IllegalArgumentException("Team lead must belong to the same department as the team");
            }

            team.setTeamLead(newTeamLead);
        }

        Team savedTeam = teamRepository.save(team);
        return convertToDTO(savedTeam);
    }

    @CacheEvict(value = {"teams", "team"}, allEntries = true)
    public void deleteTeam(Long id) {
        String tenantId = requireTenantId();

        Team team = teamRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        // Unassign all users from the team
        team.getUsers().forEach(user -> user.setTeam(null));
        userRepository.saveAll(team.getUsers());

        teamRepository.delete(team);
    }

    @Cacheable(value = "team", key = "#id")
    public TeamDTO getTeamById(Long id) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return null;
        }
        Team team = teamRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        return convertToDTO(team);
    }

    @Cacheable(value = "teams")
    public List<TeamDTO> getTeamsByDepartment(Long departmentId) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return teamRepository.findByDepartmentIdAndTenantId(departmentId, tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "teams")
    public List<TeamDTO> getAllTeams() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return teamRepository.findByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"teams", "team", "users"}, allEntries = true)
    public TeamDTO assignUserToTeam(Long teamId, String userEmail) {
        String tenantId = requireTenantId();

        Team team = teamRepository.findByIdAndTenantId(teamId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate user belongs to same department as team
        if (user.getDepartment() == null || !user.getDepartment().getId().equals(team.getDepartment().getId())) {
            throw new IllegalArgumentException("User must belong to the same department as the team");
        }

        // Remove user from previous team if assigned
        if (user.getTeam() != null && !user.getTeam().getId().equals(teamId)) {
            user.getTeam().getUsers().remove(user);
        }

        user.setTeam(team);
        userRepository.save(user);

        return convertToDTO(team);
    }

    @CacheEvict(value = {"teams", "team", "users"}, allEntries = true)
    public TeamDTO removeUserFromTeam(Long teamId, String userEmail) {
        String tenantId = requireTenantId();

        Team team = teamRepository.findByIdAndTenantId(teamId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        User user = userRepository.findByEmailAndTenantId(userEmail, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
            throw new IllegalArgumentException("User is not assigned to this team");
        }

        user.setTeam(null);
        userRepository.save(user);

        return convertToDTO(team);
    }

    /**
     * Compute user's effective manager based on team/department hierarchy.
     * Priority: team lead → department manager → null
     */
    public User getEffectiveManager(User user) {
        if (user == null) {
            return null;
        }

        // Priority 1: If user belongs to a team with a team lead
        if (user.getTeam() != null && user.getTeam().getTeamLead() != null) {
            return user.getTeam().getTeamLead();
        }

        // Priority 2: If user belongs to a department with a manager
        if (user.getDepartment() != null && user.getDepartment().getManager() != null) {
            return user.getDepartment().getManager();
        }

        // Priority 3: No manager
        return null;
    }

    private TeamDTO convertToDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());

        if (team.getDepartment() != null) {
            dto.setDepartmentId(team.getDepartment().getId());
            dto.setDepartmentName(team.getDepartment().getName());
        }

        if (team.getTeamLead() != null) {
            dto.setTeamLeadId(team.getTeamLead().getId());
            dto.setTeamLeadEmail(team.getTeamLead().getEmail());
            dto.setTeamLeadName(team.getTeamLead().getFirstName() + " " + team.getTeamLead().getLastName());
        }

        if (team.getUsers() != null) {
            dto.setUserIds(team.getUsers().stream()
                    .map(User::getId)
                    .collect(Collectors.toList()));
            dto.setUserCount(team.getUsers().size());
        } else {
            dto.setUserCount(0);
        }

        return dto;
    }
}

