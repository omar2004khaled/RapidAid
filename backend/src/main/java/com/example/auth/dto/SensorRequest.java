package com.example.auth.dto;

import com.example.auth.enums.SensorType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorRequest {
    private Integer vehicleId;
    private SensorType sensorType;
    private String description;
}
