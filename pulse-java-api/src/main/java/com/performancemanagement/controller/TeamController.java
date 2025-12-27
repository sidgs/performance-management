package com.performancemanagement.controller;

import com.performancemanagement.dto.TeamDTO;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private AuthorizationService authorizationService;

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO teamDTO) {
        try {
            authorizationService.requireEpmOrHrAdmin();
            TeamDTO created = teamService.createTeam(teamDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        try {
            TeamDTO team = teamService.getTeamById(id);
            return new ResponseEntity<>(team, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        List<TeamDTO> teams = teamService.getAllTeams();
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByDepartment(@PathVariable Long departmentId) {
        try {
            List<TeamDTO> teams = teamService.getTeamsByDepartment(departmentId);
            return new ResponseEntity<>(teams, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long id, @RequestBody TeamDTO teamDTO) {
        try {
            authorizationService.requireEpmOrHrAdmin();
            TeamDTO updated = teamService.updateTeam(id, teamDTO);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        try {
            authorizationService.requireEpmOrHrAdmin();
            teamService.deleteTeam(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/assign/{userEmail}")
    public ResponseEntity<TeamDTO> assignUserToTeam(@PathVariable Long id, @PathVariable String userEmail) {
        try {
            authorizationService.requireEpmOrHrAdmin();
            TeamDTO team = teamService.assignUserToTeam(id, userEmail);
            return new ResponseEntity<>(team, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/remove/{userEmail}")
    public ResponseEntity<TeamDTO> removeUserFromTeam(@PathVariable Long id, @PathVariable String userEmail) {
        try {
            authorizationService.requireEpmOrHrAdmin();
            TeamDTO team = teamService.removeUserFromTeam(id, userEmail);
            return new ResponseEntity<>(team, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}

