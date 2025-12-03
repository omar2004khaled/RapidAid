package com.example.auth.service;

import com.example.auth.dto.IncidentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private IncidentService incidentService;

    public void notifyIncidentUpdate() {
        logger.info("Attempting to send WebSocket notification...");
        Page<IncidentResponse> updatedIncidents = incidentService.getReportedIncidentsOrdered(PageRequest.of(0, 10));
        logger.info("Fetched incidents to broadcast");
        messagingTemplate.convertAndSend("/topic/incidents", updatedIncidents);
        logger.info("✅ WebSocket message sent to /topic/incidents");
    }


}
