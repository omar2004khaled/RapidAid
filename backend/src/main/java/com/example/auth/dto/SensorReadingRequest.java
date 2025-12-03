package com.example.auth.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorReadingRequest {
    private Integer sensorId;
    private String value;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
