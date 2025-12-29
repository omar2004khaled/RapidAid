package com.example.auth.service;

import com.example.auth.dto.IncidentResponse;
import com.example.auth.dto.NotificationResponse;
import com.example.auth.dto.VehicleResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final IncidentService incidentService;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate, @Lazy IncidentService incidentService) {
        this.messagingTemplate = messagingTemplate;
        this.incidentService = incidentService;
    }

    public void notifyAcceptedIncidentUpdate() {
        logger.info("Processing accepted incident update notification.....");
        List<IncidentResponse> updatedIncidents = incidentService.getAcceptedIncidentsOrdered();
        messagingTemplate.convertAndSend("/topic/incident/accepted", updatedIncidents);
        logger.info("Sending accepted incident update notification via WebSocket.");
    }

    public void notifyReportedIncidentUpdate() {
        logger.info("Processing reported incident update notification.....");
        List<IncidentResponse> updatedIncidents = incidentService.getReportedIncidents();
        messagingTemplate.convertAndSend("/topic/incident/reported", updatedIncidents);
        logger.info("Sending reported incident update notification via WebSocket.");
    }

    public void notifyAvailableVehicleUpdate(List<VehicleResponse> availableVehicles) {
        logger.info("Processing available vehicle update notification.....");
        messagingTemplate.convertAndSend("/topic/vehicle/available", availableVehicles);
        logger.info("Sending available vehicle update notification via WebSocket.");
    }

    public void notifyUnreadNotificationsUpdate(List<NotificationResponse> unreadNotifications) {
        logger.info("Processing unread notifications update.....");
        messagingTemplate.convertAndSend("/topic/notification/unread", unreadNotifications);
        logger.info("Sending unread notifications update via WebSocket.");
    }

}
