package com.example.auth.dto;

import com.example.auth.enums.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationResponse {
    private Integer stationId;
    private String name;
    private ServiceType serviceType;
    private AddressResponse address;
    private String contactNumber;
    private Integer capacity;
}
