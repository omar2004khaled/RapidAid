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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentMapper incidentMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;

    public IncidentService(AssignmentRepository assignmentRepository,
                          IncidentRepository incidentRepository,
                          IncidentMapper incidentMapper,
                          WebSocketNotificationService webSocketNotificationService) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
        this.incidentMapper = incidentMapper;
        this.webSocketNotificationService = webSocketNotificationService;
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
    public List<IncidentResponse> getAcceptedIncidentsOrdered() {
        List<Incident> incidents =  incidentRepository.findAllAcceptedIncidentsOrderedBySeverityLevelAndTimeReported();
        return incidents.stream()
                        .map(incidentMapper::toResponse)
                        .toList();
    }

    @Transactional
    public List<IncidentResponse> getResolvedIncidents() {
        List <Incident> incidents =  incidentRepository.findAllResolvedIncidents();
        return incidents.stream()
                        .map(incidentMapper::toResponse)
                        .toList();
    }

    @Transactional
    public List<IncidentResponse> getReportedIncidents() {
        List<Incident> incidents =  incidentRepository.findAllReportedIncidents();
        return incidents.stream()
                        .map(incidentMapper::toResponse)
                        .toList();
    }

    @Transactional
    public List<IncidentResponse> getAllIncidents() {
        List<Incident> incidents =  incidentRepository.findAll();
        return incidents.stream()
                        .map(incidentMapper::toResponse)
                        .toList();
    }

    @Transactional
    public IncidentResponse createIncident(IncidentRequest incidentRequest) {
        Incident incident = incidentMapper.toEntity(incidentRequest);

        // Save the incident
        Incident savedIncident = incidentRepository.save(incident);

        // Notify via WebSocket
        webSocketNotificationService.notifyReportedIncidentUpdate();

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

        if (incident.getLifeCycleStatus() == IncidentStatus.ACCEPTED)
            webSocketNotificationService.notifyAcceptedIncidentUpdate();
        else
            webSocketNotificationService.notifyReportedIncidentUpdate();

        return incidentMapper.toResponse(updatedIncident);
    }

    @Transactional
    public IncidentResponse updateToAccepted(Integer incidentId) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        final IncidentStatus previousStatus = incident.getLifeCycleStatus();

        /* Quick return if already accepted */
        if (previousStatus == IncidentStatus.ACCEPTED)
            return incidentMapper.toResponse(incident);

        // Update status to ACCEPTED
        incident.setLifeCycleStatus(IncidentStatus.ACCEPTED);
        Incident updatedIncident = incidentRepository.save(incident);

        // Update notifications
        if(previousStatus != IncidentStatus.REPORTED)
            webSocketNotificationService.notifyReportedIncidentUpdate();
        webSocketNotificationService.notifyAcceptedIncidentUpdate();

        return incidentMapper.toResponse(updatedIncident);
    }

    @Transactional
    public IncidentResponse updateToResolved(Integer incidentId) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        final IncidentStatus previousStatus = incident.getLifeCycleStatus();

        /* Quick return if already resolved */
        if (previousStatus == IncidentStatus.RESOLVED)
            return incidentMapper.toResponse(incident);

        // Update status to RESOLVED
        incident.setLifeCycleStatus(IncidentStatus.RESOLVED);
        incident.setTimeResolved(LocalDateTime.now());
        Incident updatedIncident = incidentRepository.save(incident);

        return incidentMapper.toResponse(updatedIncident);
    }

    @Transactional
    public Boolean cancelIncident(Integer incidentId) {
        Incident incident = incidentRepository.findIncidentById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        Boolean present = incidentRepository.findIncidentById(incidentId).isPresent();
        if (present)
            incidentRepository.deleteById(incidentId);

        return present;
    }

    @Transactional
    public void deleteIncident(Integer incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));
        
        // Delete associated assignments first
        assignmentRepository.deleteByIncidentIncidentId(incidentId);
        
        // Delete the incident (this will also delete the address due to cascade)
        incidentRepository.deleteById(incidentId);
    }
}