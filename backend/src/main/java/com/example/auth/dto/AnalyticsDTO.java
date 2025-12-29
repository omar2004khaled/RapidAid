package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

public class AnalyticsDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private Double averageResponseTimeMinutes; // assignedAt - reportedAt
        private Double averageArrivalTimeMinutes;  // arrivedAt - assignedAt
        private Double averageResolutionTimeMinutes; // completedAt - reportedAt
        private Long totalIncidentsResolved;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseTimeTrend {
        private String date; // Format YYYY-MM-DD
        private Double averageTimeMinutes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopUnitPerformance {
        private Integer vehicleId;
        private String registrationNumber;
        private Long tasksCompleted;
        private Double averageJobCompletionTimeMinutes;
    }
}
