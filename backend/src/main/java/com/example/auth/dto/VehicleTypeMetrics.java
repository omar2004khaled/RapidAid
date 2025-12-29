package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleTypeMetrics {
    private String vehicleType;
    private Long totalAssignments;
    private Double averageResponseTime;
    private Double averageArrivalTime;
    private Double averageTotalTime;
}
