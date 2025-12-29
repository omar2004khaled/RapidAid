package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopPerformingUnit {
    private Integer vehicleId;
    private String vehicleType;
    private String registrationNumber;
    private Long totalAssignments;
    private Double averageResponseTime; // in minutes
    private Double averageArrivalTime; // in minutes
    private Double averageTotalTime; // in minutes
    private Long completedAssignments;
    private Double completionRate; // percentage
}
