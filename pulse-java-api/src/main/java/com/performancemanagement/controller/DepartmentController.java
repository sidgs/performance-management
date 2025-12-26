package com.performancemanagement.controller;

import com.performancemanagement.dto.DepartmentDTO;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private AuthorizationService authorizationService;

    @PostMapping
    public ResponseEntity<DepartmentDTO> createDepartment(@RequestBody DepartmentDTO departmentDTO) {
        try {
            authorizationService.requireHrAdmin();
            DepartmentDTO created = departmentService.createDepartment(departmentDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        try {
            DepartmentDTO department = departmentService.getDepartmentById(id);
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        List<DepartmentDTO> departments = departmentService.getAllDepartments();
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @GetMapping("/root")
    public ResponseEntity<List<DepartmentDTO>> getRootDepartments() {
        List<DepartmentDTO> departments = departmentService.getRootDepartments();
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDTO> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO departmentDTO) {
        try {
            authorizationService.requireHrAdmin();
            DepartmentDTO updated = departmentService.updateDepartment(id, departmentDTO);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{departmentId}/assign/{userEmail}")
    public ResponseEntity<DepartmentDTO> assignUserToDepartment(@PathVariable Long departmentId, @PathVariable String userEmail) {
        try {
            authorizationService.requireHrAdmin();
            DepartmentDTO department = departmentService.assignUserToDepartment(departmentId, userEmail);
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        try {
            authorizationService.requireHrAdmin();
            departmentService.deleteDepartment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/managed-by-me")
    public ResponseEntity<List<DepartmentDTO>> getDepartmentsManagedByMe() {
        try {
            List<DepartmentDTO> departments = departmentService.getDepartmentsManagedByMe();
            return new ResponseEntity<>(departments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/set-manager/{userEmail}")
    public ResponseEntity<DepartmentDTO> setDepartmentManager(@PathVariable Long id, @PathVariable String userEmail) {
        try {
            authorizationService.requireHrAdmin();
            DepartmentDTO department = departmentService.setDepartmentManager(id, userEmail);
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/assign-assistant/{userEmail}")
    public ResponseEntity<DepartmentDTO> assignManagerAssistant(@PathVariable Long id, @PathVariable String userEmail) {
        try {
            authorizationService.requireDepartmentManager(id);
            DepartmentDTO department = departmentService.assignManagerAssistant(id, userEmail);
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/move-user/{userId}")
    public ResponseEntity<DepartmentDTO> moveUserToDepartment(@PathVariable Long id, @PathVariable Long userId) {
        try {
            authorizationService.requireHrAdmin();
            DepartmentDTO department = departmentService.moveUserToDepartment(userId, id);
            return new ResponseEntity<>(department, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<com.performancemanagement.dto.UserDTO>> getDepartmentMembers(@PathVariable Long id) {
        try {
            List<com.performancemanagement.dto.UserDTO> members = departmentService.getDepartmentMembers(id);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/eligible-managers")
    public ResponseEntity<List<com.performancemanagement.dto.UserDTO>> getEligibleManagersForDepartment(@PathVariable Long id) {
        try {
            List<com.performancemanagement.dto.UserDTO> eligibleManagers = departmentService.getEligibleManagersForDepartment(id);
            return new ResponseEntity<>(eligibleManagers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
}
