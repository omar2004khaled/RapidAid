package com.example.auth.entity.VehicleStaff;

import com.example.auth.entity.User;
import com.example.auth.entity.Vehicle;
import jakarta.persistence.*;
import lombok.*;


@Table(name = "Vehicle_Staff")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VehicleStaff {

    @EmbeddedId
    private VehicleStaffId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("vehicleId")
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "role_on_vehicle", length = 50)
    private String roleOnVehicle;
}


