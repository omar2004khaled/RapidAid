package com.example.auth.service;

import com.example.auth.dto.SensorReadingRequest;
import com.example.auth.entity.SensorReading;
import com.example.auth.mapper.SensorReadingMapper;
import com.example.auth.repository.SensorReadingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SensorReadingServiceTest {

    @Mock
    private SensorReadingRepository repository;
    @Mock
    private SensorReadingMapper mapper;
    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private SensorReadingService sensorReadingService;

    @Test
    void updateSensorReading_Success() {
        SensorReading reading = new SensorReading();
        SensorReadingRequest request = new SensorReadingRequest();
        
        when(repository.findById(1L)).thenReturn(Optional.of(reading));

        sensorReadingService.updateSensorReading(1L, request);

        verify(mapper).updateEntityFromRequest(request, reading);
        verify(repository).save(reading);
        verify(vehicleService).checkLocationMatch(reading);
    }
}