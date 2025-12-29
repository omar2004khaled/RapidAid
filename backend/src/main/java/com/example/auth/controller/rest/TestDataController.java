package com.example.auth.controller.rest;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.entity.User;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.ServiceType;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.VehicleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequestMapping("/test/analytics")
@Tag(name = "Test Data Generation", description = "Endpoints for generating test data")
@RequiredArgsConstructor
public class TestDataController {

    private final IncidentRepository incidentRepository;
    private final VehicleRepository vehicleRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Operation(summary = "Generate completed assignments", description = "Creates random past incidents and assignments for analytics testing")
    @PostMapping("/generate-data")
    public ResponseEntity<String> generateData(@RequestParam(defaultValue = "10") int count) {
        Random random = new Random();
        User admin = userRepository.findById(1L).orElseThrow(() -> new RuntimeException("Admin not found"));

        for (int i = 0; i < count; i++) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reportedAt = now.minusDays(random.nextInt(30)).minusHours(random.nextInt(24));
            
            // Create Incident
            Incident incident = Incident.builder()
                    .incidentType(ServiceType.values()[random.nextInt(ServiceType.values().length)])
                    .severityLevel(random.nextInt(5) + 1)
                    .timeReported(reportedAt)
                    .lifeCycleStatus(IncidentStatus.RESOLVED)
                    .timeAssigned(reportedAt.plusMinutes(random.nextInt(10) + 1))
                    .timeResolved(reportedAt.plusMinutes(30 + random.nextInt(60)))
                    .reportedByUser(admin)
                    .build();
            incident = incidentRepository.save(incident);

            // Create Vehicle (if needed, or reuse)
            // Ideally we use existing vehicles, but for test we can just mock the relationship or pick random existing
            // Here assuming at least one vehicle exists. If not, catching exception.
            Vehicle vehicle = vehicleRepository.findAll().stream().findAny().orElse(null);
            if (vehicle == null) continue;

            // Create Completed Assignment
            LocalDateTime assignedAt = incident.getTimeAssigned();
            LocalDateTime acceptedAt = assignedAt.plusSeconds(random.nextInt(60));
            LocalDateTime arrivedAt = assignedAt.plusMinutes(random.nextInt(15) + 5);
            LocalDateTime completedAt = incident.getTimeResolved();

            Assignment assignment = Assignment.builder()
                    .incident(incident)
                    .vehicle(vehicle)
                    .assignedBy(admin)
                    .assignedAt(assignedAt)
                    .acceptedAt(acceptedAt)
                    .arrivedAt(arrivedAt)
                    .completedAt(completedAt)
                    .assignmentStatus(AssignmentStatus.COMPLETED)
                    .build();
                    
            assignmentRepository.save(assignment);
        }

        return ResponseEntity.ok("Generated " + count + " completed assignments.");
    }
}
