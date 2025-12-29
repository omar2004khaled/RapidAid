package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseTimeReport {
    private Integer incidentId;
    private String incidentType;
    private Integer vehicleId;
    private String vehicleType;
    private String vehicleRegistrationNumber;

    // Timestamps
    private LocalDateTime reportedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;

    // Calculated times (in minutes)
    private Long responseTime; // assignedAt - reportedAt
    private Long arrivalTime; // arrivedAt - assignedAt
    private Long totalResolutionTime; // completedAt - reportedAt

    // Status
    private String status;
}
