package com.example.auth.dto;

import com.example.auth.enums.NotificationStatus;
import com.example.auth.enums.NotificationType;
import com.example.auth.enums.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private NotificationType type;
    private Long notificationId;
    private ServiceType serviceType;
    private NotificationStatus status;
    private LocalDateTime timestamp;
}
