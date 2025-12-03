package com.example.auth.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Integer assignmentId;
    private Integer incidentId;
    private String incidentType;
    private Integer vehicleId;
    private String vehicleRegistrationNumber;
    private Integer assignedByUserId;
    private String assignedByUserName;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;
    private AssignmentStatus assignmentStatus;
    private String notes;
    private Set<VehicleType> preferredVehicleTypes;
}
