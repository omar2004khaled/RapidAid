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
import com.example.auth.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentMapper incidentMapper;
    private final WebSocketNotificationService webSocketNotificationService;
    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void checkIncidentCompletion(Incident incident) {
        List<Assignment> allAssignments = assignmentRepository.findByIncidentIncidentId(incident.getIncidentId());
        boolean allCompleted = allAssignments.stream()
                .allMatch(a -> a.getAssignmentStatus() == AssignmentStatus.COMPLETED);

        if (allCompleted) {
            incident.setLifeCycleStatus(IncidentStatus.RESOLVED);
            incident.setTimeResolved(LocalDateTime.now());
            notificationService.updateIncidentResolvedNotification(incident);
            incidentRepository.save(incident);
            
            // Notify clients that the accepted/assigned list has changed
            webSocketNotificationService.notifyAcceptedIncidentUpdate();
        }
    }

    @Transactional
    public List<IncidentResponse> getAcceptedIncidentsOrdered() {
        List<Incident> incidents = incidentRepository.findAllAcceptedIncidentsOrderedBySeverityLevelAndTimeReported();
        return incidents.stream()
                .map(incidentMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<IncidentResponse> getResolvedIncidents() {
        List<Incident> incidents = incidentRepository.findAllResolvedIncidents();
        return incidents.stream()
                .map(incidentMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<IncidentResponse> getReportedIncidents() {
        List<Incident> incidents = incidentRepository.findAllReportedIncidents();
        return incidents.stream()
                .map(incidentMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<IncidentResponse> getAllIncidents() {
        List<Incident> incidents = incidentRepository.findAll();
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

        // Create a notification for the new incident
        notificationService.createNewIncidentNotification(savedIncident);

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
        if (previousStatus != IncidentStatus.REPORTED)
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

        // Create a new notification for the resolved incident
        notificationService.updateIncidentResolvedNotification(updatedIncident);
        
        // Notify clients that the accepted/assigned list has changed
        webSocketNotificationService.notifyAcceptedIncidentUpdate();

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
        // Verify incident exists
        incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + incidentId));

        // Delete associated notifications first
        notificationRepository.deleteByRelatedIncidentIncidentId(incidentId);

        // Delete associated assignments
        assignmentRepository.deleteByIncidentIncidentId(incidentId);

        // Delete the incident (this will also delete the address due to cascade)
        incidentRepository.deleteById(incidentId);
    }
}