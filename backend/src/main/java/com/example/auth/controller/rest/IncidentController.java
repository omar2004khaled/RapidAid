package com.example.auth.controller.rest;

import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incident")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @GetMapping("/accepted-incidents")
    public ResponseEntity<List<IncidentResponse>> getReportedIncidents() {
        List<IncidentResponse> incidents = incidentService.getAcceptedIncidentsOrdered();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/reported-incidents")
    public ResponseEntity<List<IncidentResponse>> getAcceptedIncidents() {
        List<IncidentResponse> incidents = incidentService.getReportedIncidents();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/all-incidents")
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        List<IncidentResponse> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/resolved-incidents")
    public ResponseEntity<List<IncidentResponse>> getResolvedIncidents() {
        List<IncidentResponse> incidents = incidentService.getResolvedIncidents();
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

    @PutMapping("/update-to-accepted")
    public ResponseEntity<IncidentResponse> updateToAccepted(@RequestParam Integer incidentId) {
        IncidentResponse updatedIncident = incidentService.updateToAccepted(incidentId);
        return ResponseEntity.ok(updatedIncident);
    }

    @PutMapping("/update-to-resolved")
    public ResponseEntity<IncidentResponse> updateToResolved(@RequestParam Integer incidentId) {
        IncidentResponse updatedIncident = incidentService.updateToResolved(incidentId);
        return ResponseEntity.ok(updatedIncident);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelIncident(@PathVariable Integer id) {
        Boolean cancelStatus = incidentService.cancelIncident(id);
        return ResponseEntity.ok(cancelStatus);
    }

}
