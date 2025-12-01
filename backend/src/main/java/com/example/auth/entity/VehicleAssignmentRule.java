package com.example.auth.entity;


import com.example.auth.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "VehicleAssignmentRule")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VehicleAssignmentRule {
    private static final Integer DEFAULT_MIN_VEHICLES_NEEDED = 1;
    private static final Integer DEFAULT_PRIORITY = 0;
    private static final Boolean DEFAULT_ACTIVE_STATUS = true;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;

    @Column(name = "incident_location_pattern", length = 255)
    private String incidentLocationPattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type")
    private ServiceType incidentType;

    @Column(name = "min_vehicles_needed")
    private Integer minVehiclesNeeded = DEFAULT_MIN_VEHICLES_NEEDED;

    @Column(name = "priority")
    private Integer priority = DEFAULT_PRIORITY;

    @Column(name = "active")
    private Boolean active = DEFAULT_ACTIVE_STATUS;
}
