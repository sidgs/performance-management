package com.performancemanagement.controller;

import com.performancemanagement.dto.GoalDTO;
import com.performancemanagement.service.AuthorizationService;
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

    @Autowired
    private AuthorizationService authorizationService;

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

    @GetMapping("/root")
    public ResponseEntity<List<GoalDTO>> getRootGoals() {
        List<GoalDTO> goals = goalService.getRootGoals();
        return new ResponseEntity<>(goals, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @RequestBody GoalDTO goalDTO) {
        try {
            GoalDTO updated = goalService.updateGoal(id, goalDTO);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
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

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<GoalDTO>> getGoalsByDepartment(@PathVariable Long departmentId) {
        try {
            // Only EPM_ADMIN or department manager can view goals for their department
            if (!authorizationService.isEpmAdmin()) {
                authorizationService.requireDepartmentManager(departmentId);
            }
            List<GoalDTO> goals = goalService.getGoalsByDepartment(departmentId);
            return new ResponseEntity<>(goals, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/assigned/{userEmail}")
    public ResponseEntity<List<GoalDTO>> getGoalsByAssignedUser(@PathVariable String userEmail) {
        try {
            List<GoalDTO> goals = goalService.getGoalsByAssignedUser(userEmail);
            return new ResponseEntity<>(goals, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{goalId}/approve/{departmentId}")
    public ResponseEntity<GoalDTO> approveGoal(@PathVariable Long goalId, @PathVariable Long departmentId) {
        try {
            // Only department manager can approve goals for their department members
            if (!authorizationService.isEpmAdmin()) {
                authorizationService.requireDepartmentManager(departmentId);
            }
            GoalDTO goal = goalService.approveGoal(goalId, departmentId);
            return new ResponseEntity<>(goal, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{goalId}/reject/{departmentId}")
    public ResponseEntity<GoalDTO> rejectGoal(@PathVariable Long goalId, @PathVariable Long departmentId) {
        try {
            // Only department manager can reject goals for their department members
            if (!authorizationService.isEpmAdmin()) {
                authorizationService.requireDepartmentManager(departmentId);
            }
            GoalDTO goal = goalService.rejectGoal(goalId, departmentId, null);
            return new ResponseEntity<>(goal, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}
