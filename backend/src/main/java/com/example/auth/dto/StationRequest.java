package com.example.auth.dto;

import com.example.auth.enums.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationRequest {
    private String name;
    private ServiceType serviceType;
    private Integer addressId;
    private String contactNumber;
    private Integer capacity;
}
