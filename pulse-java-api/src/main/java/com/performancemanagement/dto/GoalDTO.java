package com.performancemanagement.dto;

import com.performancemanagement.model.Goal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    private String shortDescription;
    private String longDescription;
    private String ownerEmail;
    private String ownerName;
    private LocalDate creationDate;
    private LocalDate completionDate;
    private Goal.GoalStatus status;
    private Long parentGoalId;
    private List<GoalDTO> childGoals;
    private List<String> assignedUserEmails;
    private Boolean locked = false;
    private Boolean confidential = false;
    private LocalDate assignedDate;
    private LocalDate targetCompletionDate;
    private Long territoryId;
    private String territoryName;
    private List<KPIDTO> kpis;
}
