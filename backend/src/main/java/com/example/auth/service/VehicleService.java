package com.example.auth.service;

import com.example.auth.dto.VehicleResponse;
import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.entity.SensorReading;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.mapper.VehicleMapper;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleMapper vehicleMapper;

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

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findVehicleById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));
        return vehicleMapper.toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse updateStatus(Integer vehicleId, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findVehicleById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));

        vehicle.setStatus(status);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(updatedVehicle);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByStatus(VehicleStatus status) {
        List<Vehicle> vehicles = vehicleRepository.findByStatus(status.name());
        return vehicles.stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }
}
