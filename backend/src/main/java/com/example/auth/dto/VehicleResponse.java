package com.example.auth.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Integer vehicleId;
    private String registrationNumber;
    private VehicleType vehicleType;
    private Integer capacity;
    private VehicleStatus status;
    private BigDecimal lastLatitude;
    private BigDecimal lastLongitude;
    private LocalDateTime lastUpdatedTime;
}
