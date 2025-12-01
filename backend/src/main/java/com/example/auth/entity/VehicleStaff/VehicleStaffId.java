package com.example.auth.entity.VehicleStaff;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleStaffId implements Serializable {

    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Column(name = "user_id")
    private Integer userId;
}
