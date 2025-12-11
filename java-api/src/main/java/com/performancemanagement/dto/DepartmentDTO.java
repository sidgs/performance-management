package com.performancemanagement.dto;

import com.performancemanagement.model.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    private Long id;
    private String name;
    private String smallDescription;
    private String ownerEmail;
    private String ownerName;
    private String coOwnerEmail;
    private String coOwnerName;
    private LocalDate creationDate;
    private Department.DepartmentStatus status;
    private Long parentDepartmentId;
    private List<DepartmentDTO> childDepartments;
    private List<String> userEmails;
}
