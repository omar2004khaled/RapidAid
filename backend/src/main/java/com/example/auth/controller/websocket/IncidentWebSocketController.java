package com.example.auth.controller.websocket;

import com.example.auth.dto.IncidentResponse;
import com.example.auth.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class IncidentWebSocketController {

    @Autowired
    private IncidentService incidentService;

    @MessageMapping("/incidents/refresh")
    @SendTo("/topic/incidents")
    public Page<IncidentResponse> refreshIncidents(int page, int size) {
        return incidentService.getReportedIncidentsOrdered(PageRequest.of(page, size > 0 ? size : 10));
    }
}
