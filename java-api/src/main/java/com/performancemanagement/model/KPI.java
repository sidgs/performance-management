package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "epm_kpis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"goal"})
public class KPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private KPIStatus status = KPIStatus.NOT_STARTED;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 0;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    public enum KPIStatus {
        NOT_STARTED,
        IN_PROGRESS,
        ACHIEVED,
        NOT_ACHIEVED,
        COMPLETED
    }
}


