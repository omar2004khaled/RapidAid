package com.example.auth.service;

import com.example.auth.dto.SensorReadingRequest;
import com.example.auth.entity.SensorReading;
import com.example.auth.mapper.SensorReadingMapper;
import com.example.auth.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SensorReadingService {

    private final SensorReadingRepository repository;
    private final SensorReadingMapper mapper;
    private final VehicleService vehicleService;

    public SensorReadingService(SensorReadingRepository repository, SensorReadingMapper mapper,
                               VehicleService vehicleService) {
        this.repository = repository;
        this.mapper = mapper;
        this.vehicleService = vehicleService;
    }

    @Transactional
    public void updateSensorReading(Long readingId, SensorReadingRequest request) {
        SensorReading reading = repository.findById(readingId)
                .orElseThrow(() -> new RuntimeException("Sensor reading not found"));
        
        mapper.updateEntityFromRequest(request, reading);
        repository.save(reading);
        
        vehicleService.checkLocationMatch(reading);
    }
}