package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetrics {
    private Long totalIncidents;
    private Long totalAssignments;
    private Long completedAssignments;
    private Long activeAssignments;

    private Double averageResponseTime; // in minutes
    private Double averageArrivalTime; // in minutes
    private Double averageTotalTime; // in minutes

    private Double completionRate; // percentage

    // Breakdown by vehicle type
    private List<VehicleTypeMetrics> byVehicleType;
}
