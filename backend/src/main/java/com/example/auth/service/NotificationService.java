package com.example.auth.service;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.entity.Incident;
import com.example.auth.entity.Notification;
import com.example.auth.entity.User;
import com.example.auth.mapper.NotificationMapper;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.NotificationRepository;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final IncidentRepository incidentRepository;

    @Transactional
    public void notifyWebSocket() {
        List<NotificationResponse> responses = getUnreadNotifications();
        webSocketNotificationService.notifyUnreadNotificationsUpdate(responses);
    }

    @Transactional
    protected Notification createNewNotification(Incident incident) {
        Notification notification = new Notification();
        try {
            notification = notificationMapper.toEntity(incident);
            return notification;
        } catch (Exception e) {
            throw new RuntimeException("Error mapping Incident to Notification", e);
        }
    }

    @Transactional
    public NotificationResponse createNewIncidentNotification(Incident incident) {
        Notification notification = createNewNotification(incident);
        notification = notificationRepository.save(notification);
        notifyWebSocket();
        return notificationMapper.toResponse(notification);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String userEmail) {
        User reciever = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setRead(reciever);
        notification = notificationRepository.save(notification);
        notifyWebSocket();
        return notificationMapper.toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User reciever = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        List<Notification> unreadNotifications = notificationRepository.findAllUnreadNotifications();

        for (Notification notification : unreadNotifications) {
            notification.setRead(reciever);
        }

        notificationRepository.saveAll(unreadNotifications);
        notifyWebSocket();
    }

    @Transactional
    public NotificationResponse updateIncidentResolvedNotification(Incident incident) {
        Notification notification = notificationRepository.findByRelatedIncidentId(incident.getIncidentId());
        notification.setIncidentResolved();
        notification = notificationRepository.save(notification);
        notifyWebSocket();
        return notificationMapper.toResponse(notification);
    }

    @Transactional
    public List<NotificationResponse> getUnreadNotifications() {
        List<Notification> notifications = notificationRepository.findAllUnreadNotifications();
        return notifications
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Transactional
    public void saveUnassignedIncidentNotification(Incident incident) {
        Notification notification = notificationRepository.findByRelatedIncidentId(incident.getIncidentId());
        notification.setIncidentUnassigned();
        notificationRepository.save(notification);
    }

    @Transactional
    @Scheduled(fixedRateString = "${notification.update-interval-ms}")
    public void triggerUnassignedIncidentNotifications() {
        List<Incident> unassignedIncidents = incidentRepository.findAllUnassignedIncidentsForTwoMinutes();

        for (Incident incident : unassignedIncidents) {
            saveUnassignedIncidentNotification(incident);
        }

        if (!unassignedIncidents.isEmpty()) {
            notifyWebSocket();
        }
    }

}
