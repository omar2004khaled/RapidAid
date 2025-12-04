package com.example.auth.service;

import com.example.auth.dto.IncidentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private IncidentService incidentService;

    public void notifyAcceptedIncidentUpdate() {
        logger.info("Processing accepted incident update notification.....");
        List<IncidentResponse> updatedIncidents = incidentService.getAcceptedIncidentsOrdered();
        messagingTemplate.convertAndSend("/topic/incidents", updatedIncidents);
        logger.info("Sending accepted incident update notification via WebSocket.");
    }

    public void notifyReportedIncidentUpdate() {
        logger.info("Processing reported incident update notification.....");
        List<IncidentResponse> updatedIncidents = incidentService.getReportedIncidents();
        messagingTemplate.convertAndSend("/topic/incidents", updatedIncidents);
        logger.info("Sending reported incident update notification via WebSocket.");
    }
}
