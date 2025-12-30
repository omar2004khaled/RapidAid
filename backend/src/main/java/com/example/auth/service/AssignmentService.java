package com.example.auth.service;

import com.example.auth.dto.AssignmentRequest;
import com.example.auth.dto.AssignmentResponse;
import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.mapper.AssignmentMapper;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentMapper assignmentMapper;
    private final IncidentRepository incidentRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;


    @Transactional
    public void acceptAssignment(Integer assignmentId, Long responderId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

//        User responder = userRepository.findById(responderId)
//                .orElseThrow(() -> new RuntimeException("Responder not found"));
//
//        if (!assignment.getVehicle().getDriver().getUserId().equals(responderId)) {
//            throw new RuntimeException("Responder is not the driver of this vehicle");
//        }

        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setAssignmentStatus(AssignmentStatus.ENROUTE);
        assignmentRepository.save(assignment);

        Vehicle vehicle = assignment.getVehicle();
        vehicle.setStatus(VehicleStatus.ON_ROUTE);
        vehicleRepository.save(vehicle);
    }

    public List<AssignmentResponse> getAllAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll();
        return assignments.stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    public List<AssignmentResponse> getEnrouteAssignments() {
        List<Assignment> assignments = assignmentRepository.findByAssignmentStatus(AssignmentStatus.ENROUTE.name());
        return assignments.stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    public List<AssignmentResponse> getCompletedAssignments() {
        List<Assignment> assignments = assignmentRepository.findByAssignmentStatus(AssignmentStatus.COMPLETED.name());
        return assignments.stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    public List<AssignmentResponse> getAssignmentsByStatus(AssignmentStatus status) {
        List<Assignment> assignments = assignmentRepository.findByAssignmentStatus(status.name());
        return assignments.stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public AssignmentResponse reassignAssignment(Integer assignmentId, Integer newVehicleId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        Vehicle newVehicle = vehicleRepository.findVehicleById(newVehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + newVehicleId));

        // Update old vehicle status
        Vehicle oldVehicle = assignment.getVehicle();
        oldVehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(oldVehicle);

        // Assign to new vehicle
        assignment.setVehicle(newVehicle);
        assignment.setAssignedAt(LocalDateTime.now());
        newVehicle.setOnRoute();
        vehicleRepository.save(newVehicle);

        Assignment reassignedAssignment = assignmentRepository.save(assignment);

        return assignmentMapper.toResponse(reassignedAssignment);
    }

    @Transactional
    public AssignmentResponse updateAssignmentStatus(Integer assignmentId, AssignmentStatus status) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        assignment.setAssignmentStatus(status);

        // Update timestamps based on status
        switch (status) {
            case ENROUTE:
                if (assignment.getAcceptedAt() == null) {
                    assignment.setAcceptedAt(LocalDateTime.now());
                }
                break;
            case ARRIVED:
                if (assignment.getArrivedAt() == null) {
                    assignment.setArrivedAt(LocalDateTime.now());
                }
                break;
            case COMPLETED:
                if (assignment.getCompletedAt() == null) {
                    assignment.setCompletedAt(LocalDateTime.now());
                }
                Vehicle vehicle = assignment.getVehicle();
                vehicle.setAvailable();
                vehicleRepository.save(vehicle);
                break;
        }

        Assignment updatedAssignment = assignmentRepository.save(assignment);

        return assignmentMapper.toResponse(updatedAssignment);
    }

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest assignmentRequest) {
        Assignment assignment = assignmentMapper.toEntity(assignmentRequest);

        // Fetch and set Incident
        if (assignmentRequest.getIncidentId() != null) {
            Incident incident = incidentRepository.findById(assignmentRequest.getIncidentId())
                    .orElseThrow(() -> new RuntimeException("Incident not found with id: " + assignmentRequest.getIncidentId()));

            if(incident.getLifeCycleStatus() == IncidentStatus.RESOLVED)
                throw new RuntimeException("Cannot assign a resolved incident with id: " + assignmentRequest.getIncidentId());
            assignment.setIncident(incident);
        }

        // Fetch and set Vehicle
        if (assignmentRequest.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findVehicleById(assignmentRequest.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + assignmentRequest.getVehicleId()));
            if(vehicle.getStatus() != VehicleStatus.AVAILABLE)
                throw new RuntimeException("Vehicle with id: " + assignmentRequest.getVehicleId() + " is not available for assignment");
            assignment.setVehicle(vehicle);
        }

        // Fetch and set AssignedBy User
        if (assignmentRequest.getAssignedByUserId() != null) {
            assignment.setAssignedBy(userRepository.findById(assignmentRequest.getAssignedByUserId().longValue())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + assignmentRequest.getAssignedByUserId())));
        }

        // Update incident status before saving assignment
        Incident incident = assignment.getIncident();
        incident.setAssigned();
        incidentRepository.save(incident);

        // Set assignment status and timestamp
        assignment.setAssignmentStatus(AssignmentStatus.ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Update vehicle status to ON_ROUTE
        Vehicle vehicle = assignment.getVehicle();
        vehicle.setOnRoute();
        vehicleRepository.save(vehicle);

        // Notify via WebSocket
        // Notify via WebSocket
        webSocketNotificationService.notifyReportedIncidentUpdate();
        webSocketNotificationService.notifyAcceptedIncidentUpdate();

        // Return the saved assignment as response
        return assignmentMapper.toResponse(savedAssignment);
    }
}