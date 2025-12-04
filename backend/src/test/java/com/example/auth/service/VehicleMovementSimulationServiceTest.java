package com.example.auth.service;

import com.example.auth.entity.Address;
import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleMovementSimulationServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private IncidentService incidentService;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @InjectMocks
    private VehicleMovementSimulationService simulationService;

    private Assignment testAssignment;
    private Vehicle testVehicle;
    private Incident testIncident;
    private Address testAddress;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(simulationService, "simulationEnabled", true);
        ReflectionTestUtils.setField(simulationService, "stepDistanceKm", 0.5);
        ReflectionTestUtils.setField(simulationService, "arrivalThresholdKm", 0.1);
        ReflectionTestUtils.setField(simulationService, "serviceTimeSeconds", 30);

        testAddress = new Address();
        testAddress.setLatitude(new BigDecimal("30.0444"));
        testAddress.setLongitude(new BigDecimal("31.2357"));

        testIncident = new Incident();
        testIncident.setIncidentId(1);
        testIncident.setAddress(testAddress);

        testVehicle = new Vehicle();
        testVehicle.setVehicleId(1);
        testVehicle.setStatus(VehicleStatus.ON_ROUTE);
        testVehicle.setLastLatitude(new BigDecimal("30.0400"));
        testVehicle.setLastLongitude(new BigDecimal("31.2300"));

        testAssignment = new Assignment();
        testAssignment.setAssignmentId(1);
        testAssignment.setVehicle(testVehicle);
        testAssignment.setIncident(testIncident);
        testAssignment.setAssignmentStatus(AssignmentStatus.ENROUTE);
    }

    @Test
    void updateVehicleLocation_NoActiveAssignments() {
        when(assignmentRepository.findByAssignmentStatusIn(anyList())).thenReturn(List.of());

        simulationService.updateVehicleLocation();

        verify(assignmentRepository).findByAssignmentStatusIn(anyList());
        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void updateVehicleLocation_SimulationDisabled() {
        ReflectionTestUtils.setField(simulationService, "simulationEnabled", false);

        simulationService.updateVehicleLocation();

        verify(assignmentRepository, never()).findByAssignmentStatusIn(anyList());
    }

    @Test
    void updateVehicleLocation_VehicleMovesCloser() {
        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        simulationService.updateVehicleLocation();

        verify(vehicleRepository, atLeastOnce()).save(testVehicle);
        // Assignment is not saved when status is already ENROUTE (only when ASSIGNED)
    }

    @Test
    void updateVehicleLocation_InitializesVehicleLocation() {
        testVehicle.setLastLatitude(null);
        testVehicle.setLastLongitude(null);

        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        simulationService.updateVehicleLocation();

        verify(vehicleRepository, atLeastOnce()).save(testVehicle);
    }

    @Test
    void updateVehicleLocation_ChangesStatusToEnroute() {
        testAssignment.setAssignmentStatus(AssignmentStatus.ASSIGNED);

        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);

        simulationService.updateVehicleLocation();

        verify(assignmentRepository, atLeastOnce()).save(any(Assignment.class));
    }

    @Test
    void updateVehicleLocation_HandlesArrival() {
        // Set vehicle very close to incident
        testVehicle.setLastLatitude(testAddress.getLatitude());
        testVehicle.setLastLongitude(testAddress.getLongitude());

        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);

        simulationService.updateVehicleLocation();

        verify(assignmentRepository, atLeastOnce()).save(any(Assignment.class));
        verify(webSocketNotificationService).notifyAcceptedIncidentUpdate();
    }

    @Test
    void updateVehicleLocation_HandlesServiceTimeCompletion() {
        testAssignment.setAssignmentStatus(AssignmentStatus.ARRIVED);
        testAssignment.setArrivedAt(LocalDateTime.now().minusMinutes(1));

        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));
        when(assignmentRepository.findByVehicleVehicleIdAndAssignmentStatusNot(1, "COMPLETED"))
                .thenReturn(List.of());
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        simulationService.updateVehicleLocation();

        verify(incidentService).checkIncidentCompletion(testIncident);
        verify(webSocketNotificationService).notifyAcceptedIncidentUpdate();
    }

    @Test
    void updateVehicleLocation_SkipsInvalidAssignment() {
        testAssignment.setVehicle(null);

        when(assignmentRepository.findByAssignmentStatusIn(anyList()))
                .thenReturn(List.of(testAssignment));

        simulationService.updateVehicleLocation();

        verify(vehicleRepository, never()).save(any());
    }
}
