package com.example.auth.entity;

import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Table(name = "Assignment")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id", nullable = false)
    private Integer assignmentId;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "incident_id", referencedColumnName = "incident_id")
    private Incident incident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id", referencedColumnName = "user_id")
    private User assignedBy;

    @CreationTimestamp
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at", nullable = true)
    private LocalDateTime acceptedAt;

    @Column(name = "arrived_at", nullable = true)
    private LocalDateTime arrivedAt;

    @Column(name = "completed_at", nullable = true)
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_status")
    private AssignmentStatus assignmentStatus = AssignmentStatus.ASSIGNED;

    @Column(name = "notes", length = 255)
    private String notes;

    @ElementCollection(targetClass = VehicleType.class)
    @CollectionTable(name = "Rule_Preferred_Vehicle_Type", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "vehicle_type")
    @Enumerated(EnumType.STRING)
    private Set<VehicleType> preferredVehicleTypes = new HashSet<>();
}
