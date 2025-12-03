package com.example.auth.controller.rest;

import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incident")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @GetMapping("/get-reported")
    public ResponseEntity<Page<IncidentResponse>> getReportedIncidents(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Page<IncidentResponse> incidents = incidentService.getReportedIncidentsOrdered(PageRequest.of(page, size));
        return ResponseEntity.ok(incidents);
    }

    @PostMapping("/create-incident")
    public ResponseEntity<IncidentResponse> createIncident(@RequestBody IncidentRequest incidentRequest) {
        IncidentResponse createdIncident = incidentService.createIncident(incidentRequest);
        return ResponseEntity.ok(createdIncident);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Integer id) {
        IncidentResponse incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incident);
    }

    @PutMapping("/update-priority")
    public ResponseEntity<IncidentResponse> updatePriority(
            @RequestParam Integer incidentId,
            @RequestParam Integer priority
    ) {
        IncidentResponse updatedIncident = incidentService.updatePriority(incidentId, priority);
        return ResponseEntity.ok(updatedIncident);
    }

    @PutMapping("/update-status")
    public ResponseEntity<IncidentResponse> updateStatus(
            @RequestParam Integer incidentId,
            @RequestParam IncidentStatus status
    ) {
        IncidentResponse updatedIncident = incidentService.updateStatus(incidentId, status);
        return ResponseEntity.ok(updatedIncident);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<IncidentResponse> cancelIncident(@PathVariable Integer id) {
        IncidentResponse cancelledIncident = incidentService.cancelIncident(id);
        return ResponseEntity.ok(cancelledIncident);
    }

}
