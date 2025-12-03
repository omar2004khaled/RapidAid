package com.example.auth.dto;

import com.example.auth.enums.NotificationStatus;
import com.example.auth.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private UserRole type;
    private String message;
    private NotificationStatus status;
    private Integer receiverUserId;
    private Integer relatedIncidentId;
}
