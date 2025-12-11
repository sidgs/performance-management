package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tenants", uniqueConstraints = {
    @UniqueConstraint(columnNames = "subdomain")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subdomain", nullable = false, unique = true)
    private String subdomain;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
