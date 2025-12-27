package com.performancemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private Long id;
    private String name;
    private String description;
    private Long departmentId;
    private String departmentName;
    private Long teamLeadId;
    private String teamLeadEmail;
    private String teamLeadName;
    private List<Long> userIds;
    private Integer userCount;
}

