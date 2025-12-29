package com.example.auth.controller.websocket;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final NotificationService notificationService;

    @MessageMapping("/notification/unread-refresh")
    @SendTo("/topic/notification/unread")
    public List<NotificationResponse> refreshUnreadNotifications() {
        return notificationService.getUnreadNotifications();
    }




}
