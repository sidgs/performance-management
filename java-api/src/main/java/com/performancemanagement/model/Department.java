package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "small_description", nullable = false, length = 500)
    private String smallDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_owner_id")
    private User coOwner;

    @Column(name = "creation_date", nullable = false)
    private LocalDate creationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DepartmentStatus status = DepartmentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parentDepartment;

    @OneToMany(mappedBy = "parentDepartment", cascade = CascadeType.ALL)
    private Set<Department> childDepartments = new HashSet<>();

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private Set<User> users = new HashSet<>();

    public enum DepartmentStatus {
        ACTIVE,
        DEPRECATED,
        RETIRED
    }
}
