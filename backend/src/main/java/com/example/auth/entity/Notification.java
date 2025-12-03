package com.example.auth.entity;

import com.example.auth.enums.NotificationStatus;
import com.example.auth.enums.UserRole;
import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Table(name = "Notification")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private UserRole type;

    @Column(name = "message", length = 255)
    private String message;

    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private NotificationStatus status = NotificationStatus.UNREAD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_user_id", referencedColumnName = "user_id", nullable = true)
    private User receiver;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_incident_id", referencedColumnName = "incident_id", nullable = true)
    private Incident relatedIncident;
}
