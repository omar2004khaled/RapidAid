package com.example.auth.dto;

import java.math.BigDecimal;

import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    private String registrationNumber;
    private VehicleType vehicleType;
    private Integer driverUserId;
    private Integer stationId;
    private Integer capacity;
    private VehicleStatus status;
    private BigDecimal lastLatitude;
    private BigDecimal lastLongitude;
}
