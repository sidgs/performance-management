package com.performancemanagement.controller;

import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalDTO> createGoal(@RequestBody GoalDTO goalDTO) {
        try {
            GoalDTO created = goalService.createGoal(goalDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDTO> getGoalById(@PathVariable Long id) {
        try {
            GoalDTO goal = goalService.getGoalById(id);
            return new ResponseEntity<>(goal, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<GoalDTO>> getAllGoals() {
        List<GoalDTO> goals = goalService.getAllGoals();
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }

    @GetMapping("/owner/{email}")
    public ResponseEntity<List<GoalDTO>> getGoalsByOwner(@PathVariable String email) {
        List<GoalDTO> goals = goalService.getGoalsByOwner(email);
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @RequestBody GoalDTO goalDTO) {
        try {
            GoalDTO updated = goalService.updateGoal(id, goalDTO);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{goalId}/assign/{userEmail}")
    public ResponseEntity<GoalDTO> assignGoalToUser(@PathVariable Long goalId, @PathVariable String userEmail) {
        try {
            GoalDTO goal = goalService.assignGoalToUser(goalId, userEmail);
            return new ResponseEntity<>(goal, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        try {
            goalService.deleteGoal(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<GoalDTO> approveGoal(@PathVariable Long id) {
        try {
            GoalDTO goal = goalService.approveGoal(id);
            return new ResponseEntity<>(goal, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<List<GoalDTO>> getGoalsPendingApproval(@RequestParam Long departmentId) {
        try {
            List<GoalDTO> goals = goalService.getGoalsPendingApprovalForDepartment(departmentId);
            return new ResponseEntity<>(goals, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/department/{id}/members")
    public ResponseEntity<List<GoalDTO>> getDepartmentMembersGoals(@PathVariable Long id) {
        try {
            List<GoalDTO> goals = goalService.getDepartmentMembersGoals(id);
            return new ResponseEntity<>(goals, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}
