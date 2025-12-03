package com.example.auth.dto;

import java.time.LocalDateTime;

import com.example.auth.enums.SensorType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorResponse {
    private Integer sensorId;
    private Integer vehicleId;
    private String vehicleRegistrationNumber;
    private SensorType sensorType;
    private LocalDateTime installedAt;
    private String description;
}
