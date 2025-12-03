package com.example.auth.service;

import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.mapper.IncidentMapper;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

    @Autowired
    private IncidentMapper incidentMapper;

    @Autowired
    WebSocketNotificationService webSocketNotificationService;

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;

    public IncidentService(AssignmentRepository assignmentRepository, IncidentRepository incidentRepository) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public void checkIncidentCompletion(Incident incident) {
        List<Assignment> allAssignments = assignmentRepository.findByIncidentIncidentId(incident.getIncidentId());
        boolean allCompleted = allAssignments.stream()
                .allMatch(a -> a.getAssignmentStatus() == AssignmentStatus.COMPLETED);

        if (allCompleted) {
            incident.setLifeCycleStatus(IncidentStatus.RESOLVED);
            incident.setTimeResolved(LocalDateTime.now());
            incidentRepository.save(incident);
        }
    }

    @Transactional
    public Page<IncidentResponse> getReportedIncidentsOrdered(Pageable pageable) {
        Page<Incident> incidents =  incidentRepository.findAllReportedIncidentsOrderedBySeverityLevelAndTimeReported(pageable);
        return incidents.map(incidentMapper::toResponse);
    }

    @Transactional
    public IncidentResponse createIncident(IncidentRequest incidentRequest) {
        Incident incident = incidentMapper.toEntity(incidentRequest);

        // Save the incident
        Incident savedIncident = incidentRepository.save(incident);

        // Notify via WebSocket
        webSocketNotificationService.notifyIncidentUpdate();

        return incidentMapper.toResponse(savedIncident);
    }

    @Transactional(readOnly = true)
    public IncidentResponse getIncidentById(Integer incidentId) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));
        return incidentMapper.toResponse(incident);
    }

    @Transactional
    public IncidentResponse updatePriority(Integer incidentId, Integer priority) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        incident.setSeverityLevel(priority);
        Incident updatedIncident = incidentRepository.save(incident);

        webSocketNotificationService.notifyIncidentUpdate();
        return incidentMapper.toResponse(updatedIncident);
    }

    @Transactional
    public IncidentResponse updateStatus(Integer incidentId, IncidentStatus status) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        incident.setLifeCycleStatus(status);

        if (status == IncidentStatus.RESOLVED) {
            incident.setTimeResolved(LocalDateTime.now());
        }

        Incident updatedIncident = incidentRepository.save(incident);
        webSocketNotificationService.notifyIncidentUpdate();
        return incidentMapper.toResponse(updatedIncident);
    }

    @Transactional
    public IncidentResponse cancelIncident(Integer incidentId) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        incident.setLifeCycleStatus(IncidentStatus.CANCELLED);
        Incident cancelledIncident = incidentRepository.save(incident);

        webSocketNotificationService.notifyIncidentUpdate();
        return incidentMapper.toResponse(cancelledIncident);
    }

}