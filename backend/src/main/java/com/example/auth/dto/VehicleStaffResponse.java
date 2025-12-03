package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleStaffResponse {
    private Integer vehicleId;
    private String vehicleRegistrationNumber;
    private Integer userId;
    private String userName;
    private String roleOnVehicle;
}
