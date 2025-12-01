package com.example.auth.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String city;
    private String neighborhood;
    private String street;
    private String buildingNo;
    private String apartmentNo;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
