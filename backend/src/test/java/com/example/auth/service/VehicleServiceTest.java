package com.example.auth.service;

import com.example.auth.dto.VehicleRequest;
import com.example.auth.dto.VehicleResponse;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;
import com.example.auth.mapper.VehicleMapper;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private IncidentService incidentService;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle testVehicle;
    private VehicleResponse testVehicleResponse;
    private VehicleRequest testVehicleRequest;

    @BeforeEach
    void setUp() {
        testVehicle = new Vehicle();
        testVehicle.setVehicleId(1);
        testVehicle.setRegistrationNumber("AMB-001");
        testVehicle.setVehicleType(VehicleType.AMBULANCE);
        testVehicle.setStatus(VehicleStatus.AVAILABLE);
        testVehicle.setCapacity(2);

        testVehicleResponse = new VehicleResponse();
        testVehicleResponse.setVehicleId(1);
        testVehicleResponse.setRegistrationNumber("AMB-001");
        testVehicleResponse.setVehicleType(VehicleType.AMBULANCE);
        testVehicleResponse.setStatus(VehicleStatus.AVAILABLE);

        testVehicleRequest = new VehicleRequest();
        testVehicleRequest.setRegistrationNumber("AMB-001");
        testVehicleRequest.setVehicleType(VehicleType.AMBULANCE);
        testVehicleRequest.setCapacity(2);
    }

    @Test
    void getVehicleById_Success() {
        when(vehicleRepository.findVehicleById(1)).thenReturn(Optional.of(testVehicle));
        when(vehicleMapper.toResponse(testVehicle)).thenReturn(testVehicleResponse);

        VehicleResponse result = vehicleService.getVehicleById(1);

        assertNotNull(result);
        assertEquals(1, result.getVehicleId());
        assertEquals("AMB-001", result.getRegistrationNumber());
        verify(vehicleRepository).findVehicleById(1);
        verify(vehicleMapper).toResponse(testVehicle);
    }

    @Test
    void getVehicleById_NotFound() {
        when(vehicleRepository.findVehicleById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> vehicleService.getVehicleById(999));
        verify(vehicleRepository).findVehicleById(999);
        verify(vehicleMapper, never()).toResponse(any());
    }

    @Test
    void updateLocation_Success() {
        BigDecimal lat = new BigDecimal("30.0444");
        BigDecimal lng = new BigDecimal("31.2357");

        when(vehicleRepository.findById(1)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);
        when(assignmentRepository.findByVehicleVehicleIdAndAssignmentStatusNot(1, "COMPLETED"))
                .thenReturn(List.of());

        vehicleService.updateLocation(1, lat, lng);

        verify(vehicleRepository).findById(1);
        verify(vehicleRepository, atLeastOnce()).save(testVehicle);
        assertEquals(lat, testVehicle.getLastLatitude());
        assertEquals(lng, testVehicle.getLastLongitude());
    }

    @Test
    void updateLocation_VehicleNotFound() {
        when(vehicleRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> vehicleService.updateLocation(999, BigDecimal.ONE, BigDecimal.ONE));

        verify(vehicleRepository).findById(999);
        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void updateStatus_Success() {
        when(vehicleRepository.findVehicleById(1)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(testVehicle)).thenReturn(testVehicle);
        when(vehicleMapper.toResponse(testVehicle)).thenReturn(testVehicleResponse);

        VehicleResponse result = vehicleService.updateStatus(1, VehicleStatus.ON_ROUTE);

        assertNotNull(result);
        verify(vehicleRepository).findVehicleById(1);
        verify(vehicleRepository).save(testVehicle);
        assertEquals(VehicleStatus.ON_ROUTE, testVehicle.getStatus());
    }

    @Test
    void getVehiclesByStatus_Success() {
        when(vehicleRepository.findByStatus("AVAILABLE")).thenReturn(List.of(testVehicle));
        when(vehicleMapper.toResponse(testVehicle)).thenReturn(testVehicleResponse);

        List<VehicleResponse> results = vehicleService.getVehiclesByStatus(VehicleStatus.AVAILABLE);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(vehicleRepository).findByStatus("AVAILABLE");
    }

    @Test
    void createVehicle_Success() {
        when(vehicleMapper.toEntity(testVehicleRequest)).thenReturn(testVehicle);
        when(vehicleRepository.save(testVehicle)).thenReturn(testVehicle);
        when(vehicleMapper.toResponse(testVehicle)).thenReturn(testVehicleResponse);

        VehicleResponse result = vehicleService.createVehicle(testVehicleRequest);

        assertNotNull(result);
        assertEquals("AMB-001", result.getRegistrationNumber());
        verify(vehicleMapper).toEntity(testVehicleRequest);
        verify(vehicleRepository).save(testVehicle);
        verify(vehicleMapper).toResponse(testVehicle);
    }
}
