package com.example.auth.service;

import com.example.auth.dto.AnalyticsDTO;
import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;

    public AnalyticsDTO.PerformanceMetrics getSystemPerformanceMetrics() {
        List<Assignment> completedAssignments = assignmentRepository.findByAssignmentStatus(AssignmentStatus.COMPLETED.name());
        
        // We need incident data associated with assignments for accurate full lifecycle times.
        // Assuming Assignment has a fetch-loaded Incident, or we lazy load it.
        
        long totalResolved = completedAssignments.size();
        
        double totalResponseTime = 0;
        double totalArrivalTime = 0;
        double totalResolutionTime = 0;
        
        int responseCount = 0;
        int arrivalCount = 0;
        int resolutionCount = 0;

        for (Assignment a : completedAssignments) {
            Incident incident = a.getIncident();
            
            // Response Time: Incident Reported -> Assignment Assigned
            if (incident != null && incident.getTimeReported() != null && a.getAssignedAt() != null) {
                totalResponseTime += Duration.between(incident.getTimeReported(), a.getAssignedAt()).toMinutes();
                responseCount++;
            }

            // Arrival Time: Assignment Assigned -> Responder Arrived
            if (a.getAssignedAt() != null && a.getArrivedAt() != null) {
                totalArrivalTime += Duration.between(a.getAssignedAt(), a.getArrivedAt()).toMinutes();
                arrivalCount++;
            }
            
            // Resolution Time: Incident Reported -> Assignment Completed (Total Lifecycle)
            if (incident != null && incident.getTimeReported() != null && a.getCompletedAt() != null) {
                totalResolutionTime += Duration.between(incident.getTimeReported(), a.getCompletedAt()).toMinutes();
                resolutionCount++;
            }
        }

        return AnalyticsDTO.PerformanceMetrics.builder()
                .averageResponseTimeMinutes(responseCount > 0 ? totalResponseTime / responseCount : 0.0)
                .averageArrivalTimeMinutes(arrivalCount > 0 ? totalArrivalTime / arrivalCount : 0.0)
                .averageResolutionTimeMinutes(resolutionCount > 0 ? totalResolutionTime / resolutionCount : 0.0)
                .totalIncidentsResolved(totalResolved)
                .build();
    }

    public List<AnalyticsDTO.ResponseTimeTrend> getDailyResponseTimeTrend(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Assignment> recentAssignments = assignmentRepository.findAssignmentsAfterDate(startDate); // Need to add this query or filter in memory

        // Group by Date
        Map<LocalDate, List<Double>> dailyTimes = new HashMap<>();

        for (Assignment a : recentAssignments) {
            if (a.getIncident() != null && a.getIncident().getTimeReported() != null && a.getAssignedAt() != null) {
                LocalDate date = a.getAssignedAt().toLocalDate();
                double minutes = Duration.between(a.getIncident().getTimeReported(), a.getAssignedAt()).toMinutes();
                dailyTimes.computeIfAbsent(date, k -> new ArrayList<>()).add(minutes);
            }
        }

        return dailyTimes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                    return new AnalyticsDTO.ResponseTimeTrend(entry.getKey().toString(), avg);
                })
                .collect(Collectors.toList());
    }

    public List<AnalyticsDTO.TopUnitPerformance> getTopPerformingUnits(int limit) {
        List<Assignment> completedAssignments = assignmentRepository.findByAssignmentStatus(AssignmentStatus.COMPLETED.name());

        // Group by Vehicle ID
        Map<Integer, List<Assignment>> vehicleAssignments = completedAssignments.stream()
                .filter(a -> a.getVehicle() != null)
                .collect(Collectors.groupingBy(a -> a.getVehicle().getVehicleId()));

        List<AnalyticsDTO.TopUnitPerformance> performances = new ArrayList<>();

        for (Map.Entry<Integer, List<Assignment>> entry : vehicleAssignments.entrySet()) {
            Integer vehicleId = entry.getKey();
            List<Assignment> assignments = entry.getValue();
            
            if (assignments.isEmpty()) continue;
            
            String regNum = assignments.get(0).getVehicle().getRegistrationNumber();
            long count = assignments.size();
            
            // Calculate avg completion time (Assigned -> Completed) for this unit
            double totalDuration = 0;
            int validDurations = 0;
            
            for (Assignment a : assignments) {
                if (a.getAssignedAt() != null && a.getCompletedAt() != null) {
                     totalDuration += Duration.between(a.getAssignedAt(), a.getCompletedAt()).toMinutes();
                     validDurations++;
                }
            }
            
            double avgTime = validDurations > 0 ? totalDuration / validDurations : 0.0;
            
            performances.add(new AnalyticsDTO.TopUnitPerformance(vehicleId, regNum, count, avgTime));
        }

        return performances.stream()
                .sorted(Comparator.comparingLong(AnalyticsDTO.TopUnitPerformance::getTasksCompleted).reversed()
                        .thenComparingDouble(AnalyticsDTO.TopUnitPerformance::getAverageJobCompletionTimeMinutes)) // Prefer more tasks, then faster times
                .limit(limit)
                .collect(Collectors.toList());
    }
}
