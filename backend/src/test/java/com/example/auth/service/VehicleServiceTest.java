package com.example.auth.service;

import com.example.auth.entity.*;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private IncidentService incidentService;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    void checkLocationMatch_UpdatesLastUpdatedTime() {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(1);
        
        Sensor sensor = new Sensor();
        sensor.setVehicle(vehicle);
        
        SensorReading reading = new SensorReading();
        reading.setSensor(sensor);
        reading.setLatitude(new BigDecimal("40.7128"));
        reading.setLongitude(new BigDecimal("-74.0060"));

        when(assignmentRepository.findByVehicleVehicleIdAndAssignmentStatusNot(1, AssignmentStatus.COMPLETED))
                .thenReturn(Collections.emptyList());

        vehicleService.checkLocationMatch(reading);
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void checkLocationMatch_CompletesAssignmentWhenLocationMatches() {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(1);
        
        Address address = new Address();
        address.setLatitude(new BigDecimal("40.7128"));
        address.setLongitude(new BigDecimal("-74.0060"));
        
        Incident incident = new Incident();
        incident.setAddress(address);
        
        Assignment assignment = new Assignment();
        assignment.setIncident(incident);
        assignment.setVehicle(vehicle);
        
        Sensor sensor = new Sensor();
        sensor.setVehicle(vehicle);
        
        SensorReading reading = new SensorReading();
        reading.setSensor(sensor);
        reading.setLatitude(new BigDecimal("40.7128"));
        reading.setLongitude(new BigDecimal("-74.0060"));

        when(assignmentRepository.findByVehicleVehicleIdAndAssignmentStatusNot(1, AssignmentStatus.COMPLETED))
                .thenReturn(List.of(assignment))
                .thenReturn(Collections.emptyList());

        vehicleService.checkLocationMatch(reading);

        verify(assignmentRepository).save(assignment);
        verify(vehicleRepository, times(2)).save(vehicle);
        verify(incidentService).checkIncidentCompletion(incident);
    }
}