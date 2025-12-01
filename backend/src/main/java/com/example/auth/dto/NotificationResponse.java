package com.example.auth.dto;

import java.time.LocalDateTime;

import com.example.auth.enums.NotificationStatus;
import com.example.auth.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long notificationId;
    private UserRole type;
    private String message;
    private LocalDateTime timestamp;
    private NotificationStatus status;
    private Integer receiverUserId;
    private String receiverUserName;
    private Integer relatedIncidentId;
    private String relatedIncidentType;
}
