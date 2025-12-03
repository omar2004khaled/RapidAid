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
    private Integer minVehiclesNeeded = 1;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "active")
    private Boolean active = true;
}
