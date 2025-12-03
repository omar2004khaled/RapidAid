package com.example.auth.entity;

import com.example.auth.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;


@Table(name = "Station")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id", nullable = false)
    private Integer stationId;

    @Column(name = "name", length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type")
    private ServiceType serviceType;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "address_id")
    private Address address;

    @Column(name = "contact_number", length = 30)
    private String contactNumber;

    @Column(name = "capacity")
    private Integer capacity;
}
