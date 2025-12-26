package com.performancemanagement.dto;

import com.performancemanagement.model.KPI;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KPIDTO {
    private Long id;
    private String description;
    private KPI.KPIStatus status;
    private Integer completionPercentage;
    private LocalDate dueDate;
    private Long goalId;
}


