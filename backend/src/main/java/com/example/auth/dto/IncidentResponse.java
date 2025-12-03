package com.example.auth.dto;

import java.time.LocalDateTime;

import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {
    private Integer incidentId;
    private ServiceType incidentType;
    private Integer reportedByUserId;
    private String reportedByUserName;
    private AddressResponse address;
    private Integer severityLevel;
    private LocalDateTime timeReported;
    private LocalDateTime timeAssigned;
    private LocalDateTime timeResolved;
    private IncidentStatus lifeCycleStatus;
}
