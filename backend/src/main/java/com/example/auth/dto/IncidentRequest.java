package com.example.auth.dto;

import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRequest {
    private ServiceType incidentType;
    private Integer reportedByUserId;
    private AddressRequest address;
    private Integer severityLevel;
    private IncidentStatus lifeCycleStatus;
}
