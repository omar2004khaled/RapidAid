package com.example.auth.controller.websocket;

import com.example.auth.dto.IncidentResponse;
import com.example.auth.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class IncidentWebSocketController {

    @Autowired
    private IncidentService incidentService;

    @MessageMapping("/incident/accepted-refresh")
    @SendTo("/topic/incident/accepted")
    public List<IncidentResponse> refreshAcceptedIncidents() {
        return incidentService.getAcceptedIncidentsOrdered();
    }

    @MessageMapping("/incident/reported-refresh")
    @SendTo("/topic/incident/reported")
    public List<IncidentResponse> refreshReportedIncidents() {
        return incidentService.getReportedIncidents();
    }
}
