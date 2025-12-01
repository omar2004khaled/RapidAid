package com.example.auth.service;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.User;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public AssignmentService(AssignmentRepository assignmentRepository, UserRepository userRepository,
                           VehicleRepository vehicleRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public void acceptAssignment(Integer assignmentId, Long responderId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new RuntimeException("Responder not found"));
        
        if (!assignment.getVehicle().getDriver().getUserId().equals(responderId)) {
            throw new RuntimeException("Responder is not the driver of this vehicle");
        }
        
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setAssignmentStatus(AssignmentStatus.ENROUTE);
        assignmentRepository.save(assignment);
        
        Vehicle vehicle = assignment.getVehicle();
        vehicle.setStatus(VehicleStatus.ON_ROUTE);
        vehicleRepository.save(vehicle);
    }
}