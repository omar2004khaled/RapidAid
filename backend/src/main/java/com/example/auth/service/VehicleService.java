package com.example.auth.service;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.entity.SensorReading;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleService {

    private final AssignmentRepository assignmentRepository;
    private final VehicleRepository vehicleRepository;
    private final IncidentService incidentService;

    public VehicleService(AssignmentRepository assignmentRepository, VehicleRepository vehicleRepository,
                         IncidentService incidentService) {
        this.assignmentRepository = assignmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.incidentService = incidentService;
    }

    @Transactional
    public void checkLocationMatch(SensorReading reading) {
        BigDecimal sensorLat = reading.getLatitude();
        BigDecimal sensorLng = reading.getLongitude();
        
        Vehicle vehicle = reading.getSensor().getVehicle();
        vehicle.setLastUpdatedTime(LocalDateTime.now());
        vehicleRepository.save(vehicle);
        
        if (sensorLat == null || sensorLng == null) return;
        
        Integer vehicleId = vehicle.getVehicleId();
        List<Assignment> activeAssignments = assignmentRepository
                .findByVehicleVehicleIdAndAssignmentStatusNot(vehicleId, AssignmentStatus.COMPLETED);
        
        for (Assignment assignment : activeAssignments) {
            Incident incident = assignment.getIncident();
            BigDecimal incidentLat = incident.getAddress().getLatitude();
            BigDecimal incidentLng = incident.getAddress().getLongitude();
            
            if (incidentLat != null && incidentLng != null &&
                sensorLat.equals(incidentLat) && sensorLng.equals(incidentLng)) {
                
                assignment.setAssignmentStatus(AssignmentStatus.COMPLETED);
                assignment.setCompletedAt(LocalDateTime.now());
                assignmentRepository.save(assignment);
                
                List<Assignment> remainingAssignments = assignmentRepository
                        .findByVehicleVehicleIdAndAssignmentStatusNot(vehicleId, AssignmentStatus.COMPLETED);
                
                if (remainingAssignments.isEmpty()) {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(vehicle);
                }
                
                incidentService.checkIncidentCompletion(incident);
            }
        }
    }
}