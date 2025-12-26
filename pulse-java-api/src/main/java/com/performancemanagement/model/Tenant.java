package com.performancemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "epm_tenants", uniqueConstraints = {
    @UniqueConstraint(columnNames = "fqdn")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    /**
     * Fully Qualified Domain Name used as the primary tenant identifier (primary key).
     * Example: acme.example.com or localhost
     */
    @Id
    @Column(name = "fqdn", nullable = false, unique = true, length = 255)
    private String fqdn;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
