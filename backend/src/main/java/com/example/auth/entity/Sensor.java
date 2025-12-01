package com.example.auth.entity;

import com.example.auth.enums.SensorType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Table(name = "Sensor")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sensor_id", nullable = false)
    private Integer sensorId;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "vehicle_id")
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "sensor_type")
    private SensorType sensorType;

    @CreationTimestamp
    @Column(name = "installed_at")
    private LocalDateTime installedAt;

    @Column(name = "description", length = 255)
    private String description;
}
