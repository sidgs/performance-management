package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "epm_users", uniqueConstraints = {
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

    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private Set<Department> managedDepartments = new HashSet<>();

    @OneToMany(mappedBy = "coOwner", cascade = CascadeType.ALL)
    private Set<Department> coOwnedDepartments = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role = Role.USER;

    /**
     * Sets the user's name by splitting a full name into first and last name.
     * If the full name contains spaces, the last word becomes the last name,
     * and everything before it becomes the first name.
     * If no spaces, the entire string becomes the first name and last name is empty.
     * 
     * @param fullName The full name to split (e.g., "John Doe" or "Mary Jane Smith")
     */
    public void setFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            this.firstName = "";
            this.lastName = "";
            return;
        }
        
        String trimmed = fullName.trim();
        int lastSpaceIndex = trimmed.lastIndexOf(' ');
        
        if (lastSpaceIndex == -1) {
            // No space found, use entire string as first name
            this.firstName = trimmed;
            this.lastName = "";
        } else {
            // Split at last space
            this.firstName = trimmed.substring(0, lastSpaceIndex).trim();
            this.lastName = trimmed.substring(lastSpaceIndex + 1).trim();
        }
    }

    public enum Role {
        EPM_ADMIN,
        HR_ADMIN,
        USER,
        MANAGER_ASSISTANT
    }
}
