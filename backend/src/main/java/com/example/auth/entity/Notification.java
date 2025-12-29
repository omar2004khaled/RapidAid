package com.example.auth.entity;

import com.example.auth.enums.NotificationStatus;
import com.example.auth.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
    private NotificationType type = NotificationType.NEW_INCIDENT;

    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "read_timestamp", nullable = true)
    private LocalDateTime readTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private NotificationStatus status = NotificationStatus.UNREAD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_user_id", referencedColumnName = "user_id", nullable = true)
    private User receiver;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_incident_id", referencedColumnName = "incident_id", nullable = true)
    private Incident relatedIncident;

    private void setUnread() {
        this.status = NotificationStatus.UNREAD;
        this.readTimestamp = null;
        this.receiver = null;
    }

    public void setRead(User receiver) {
        this.receiver = receiver;
        this.status = NotificationStatus.READ;
        this.readTimestamp = LocalDateTime.now();
    }

    public void setIncidentResolved() {
        this.type = NotificationType.INCIDENT_RESOLVED;
        setUnread();
    }

    public void setIncidentUnassigned() {
        this.type = NotificationType.INCIDENT_UNASSIGNED;
        setUnread();
    }

}
