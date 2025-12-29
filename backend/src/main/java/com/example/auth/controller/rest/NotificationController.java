package com.example.auth.controller.rest;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/all-unread")
    public List<NotificationResponse> getAllUnreadNotifications() {
        return notificationService.getUnreadNotifications();
    }

    @PutMapping("/mark-read")
    public NotificationResponse markRead(@RequestParam Long id, @RequestParam String userEmail) {
        return notificationService.markAsRead(id, userEmail);
    }

    @PutMapping("/mark-all-read")
    public void markAllRead(@RequestParam String userEmail) {
        notificationService.markAllAsRead(userEmail);
    }
}
