package com.example.auth.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorReadingResponse {
    private Long readingId;
    private Integer sensorId;
    private String sensorType;
    private String value;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
