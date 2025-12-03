package com.example.auth.entity;

import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Table(name = "Incident")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id", nullable = false)
    private Integer incidentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type")
    private ServiceType incidentType;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id", referencedColumnName = "user_id")
    private User reportedByUser;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "address_id", referencedColumnName = "address_id")
    private Address address;

    @Column(name = "severity_level")
    private Integer severityLevel;

    @CreationTimestamp
    @Column(name = "time_reported")
    private LocalDateTime timeReported;

    @Column(name = "time_assigned", nullable = true)
    private LocalDateTime timeAssigned;

    @Column(name = "time_resolved", nullable = true)
    private LocalDateTime timeResolved;

    @Enumerated(EnumType.STRING)
    @Column(name = "life_cycle_status", nullable=false)
    @Builder.Default
    private IncidentStatus lifeCycleStatus = IncidentStatus.REPORTED;

    public void setAssigned() {
        this.lifeCycleStatus = IncidentStatus.ASSIGNED;
        this.timeAssigned = LocalDateTime.now();
    }
}
