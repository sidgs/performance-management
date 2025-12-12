package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tenant_id", "email"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "title")
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private Set<User> teamMembers = new HashSet<>();

    @ManyToMany(mappedBy = "assignedUsers")
    private Set<Goal> assignedGoals = new HashSet<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private Set<Goal> ownedGoals = new HashSet<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private Set<Department> ownedDepartments = new HashSet<>();

    @OneToMany(mappedBy = "coOwner", cascade = CascadeType.ALL)
    private Set<Department> coOwnedDepartments = new HashSet<>();
}
