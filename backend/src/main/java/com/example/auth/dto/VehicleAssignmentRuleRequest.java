package com.example.auth.dto;

import com.example.auth.enums.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleAssignmentRuleRequest {
    private String incidentLocationPattern;
    private ServiceType incidentType;
    private Integer minVehiclesNeeded;
    private Integer priority;
    private Boolean active;
}
