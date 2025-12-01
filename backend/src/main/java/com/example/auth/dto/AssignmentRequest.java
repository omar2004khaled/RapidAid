package com.example.auth.dto;

import com.example.auth.enums.AssignmentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {
    private Integer incidentId;
    private Integer vehicleId;
    private Integer assignedByUserId;
    private AssignmentStatus assignmentStatus;
    private String notes;
}
