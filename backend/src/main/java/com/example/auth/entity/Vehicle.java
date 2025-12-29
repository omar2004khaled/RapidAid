package com.example.auth.entity;


import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table(name = "Vehicle")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "registration_number", length = 50, unique = true)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType;

    @Column(name = "capacity")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(name = "last_latitude", precision = 10, scale = 8)
    private BigDecimal lastLatitude;

    @Column(name = "last_longitude", precision = 11, scale = 8)
    private BigDecimal lastLongitude;

    @UpdateTimestamp
    @Column(name = "last_updated_time")
    private LocalDateTime lastUpdatedTime;

    public void setAvailable() {
        this.status = VehicleStatus.AVAILABLE;
    }

    public void setOnRoute() {
        this.status = VehicleStatus.ON_ROUTE;
    }
}
