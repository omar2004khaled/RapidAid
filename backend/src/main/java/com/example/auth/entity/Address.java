package com.example.auth.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Address")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id", nullable = false)
    private Integer addressId;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "neighborhood", length = 100)
    private String neighborhood;

    @Column(name = "street", length = 100)
    private String street;

    @Column(name = "building_no", length = 100)
    private String buildingNo;

    @Column(name = "apartment_no", length = 100)
    private String apartmentNo;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

}
