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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentMapper incidentMapper;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @InjectMocks
    private IncidentService incidentService;

    private Incident testIncident;
    private IncidentRequest testIncidentRequest;
    private IncidentResponse testIncidentResponse;

    @BeforeEach
    void setUp() {
        testIncident = new Incident();
        testIncident.setIncidentId(1);
        testIncident.setLifeCycleStatus(IncidentStatus.REPORTED);
        testIncident.setSeverityLevel(3);

        testIncidentRequest = new IncidentRequest();
        testIncidentRequest.setSeverityLevel(3);

        testIncidentResponse = new IncidentResponse();
        testIncidentResponse.setIncidentId(1);
        testIncidentResponse.setLifeCycleStatus(IncidentStatus.REPORTED);
    }

    @Test
    void checkIncidentCompletion_ResolvesWhenAllAssignmentsCompleted() {
        Incident incident = new Incident();
        incident.setIncidentId(1);

        Assignment assignment1 = new Assignment();
        assignment1.setAssignmentStatus(AssignmentStatus.COMPLETED);

        Assignment assignment2 = new Assignment();
        assignment2.setAssignmentStatus(AssignmentStatus.COMPLETED);

        when(assignmentRepository.findByIncidentIncidentId(1))
                .thenReturn(List.of(assignment1, assignment2));

        incidentService.checkIncidentCompletion(incident);

        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    void checkIncidentCompletion_DoesNotResolveWhenAssignmentsPending() {
        Incident incident = new Incident();
        incident.setIncidentId(1);

        Assignment assignment1 = new Assignment();
        assignment1.setAssignmentStatus(AssignmentStatus.COMPLETED);

        Assignment assignment2 = new Assignment();
        assignment2.setAssignmentStatus(AssignmentStatus.ENROUTE);

        when(assignmentRepository.findByIncidentIncidentId(1))
                .thenReturn(List.of(assignment1, assignment2));

        incidentService.checkIncidentCompletion(incident);

        verify(incidentRepository, never()).save(any(Incident.class));
    }

    @Test
    void createIncident_Success() {
        when(incidentMapper.toEntity(testIncidentRequest)).thenReturn(testIncident);
        when(incidentRepository.save(testIncident)).thenReturn(testIncident);
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.createIncident(testIncidentRequest);

        assertNotNull(result);
        assertEquals(1, result.getIncidentId());
        verify(incidentRepository).save(testIncident);
        verify(webSocketNotificationService).notifyReportedIncidentUpdate();
    }

    @Test
    void getIncidentById_Success() {
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.getIncidentById(1);

        assertNotNull(result);
        assertEquals(1, result.getIncidentId());
        verify(incidentRepository).findIncidentById(1);
    }

    @Test
    void getIncidentById_NotFound() {
        when(incidentRepository.findIncidentById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.getIncidentById(999));
        verify(incidentRepository).findIncidentById(999);
    }

    @Test
    void updatePriority_Success() {
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));
        when(incidentRepository.save(testIncident)).thenReturn(testIncident);
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.updatePriority(1, 5);

        assertNotNull(result);
        assertEquals(5, testIncident.getSeverityLevel());
        verify(incidentRepository).save(testIncident);
    }

    @Test
    void updateToAccepted_Success() {
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));
        when(incidentRepository.save(testIncident)).thenReturn(testIncident);
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.updateToAccepted(1);

        assertNotNull(result);
        assertEquals(IncidentStatus.ACCEPTED, testIncident.getLifeCycleStatus());
        verify(incidentRepository).save(testIncident);
        verify(webSocketNotificationService).notifyAcceptedIncidentUpdate();
    }

    @Test
    void updateToAccepted_AlreadyAccepted() {
        testIncident.setLifeCycleStatus(IncidentStatus.ACCEPTED);
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.updateToAccepted(1);

        assertNotNull(result);
        verify(incidentRepository, never()).save(any());
    }

    @Test
    void updateToResolved_Success() {
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));
        when(incidentRepository.save(testIncident)).thenReturn(testIncident);
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        IncidentResponse result = incidentService.updateToResolved(1);

        assertNotNull(result);
        assertEquals(IncidentStatus.RESOLVED, testIncident.getLifeCycleStatus());
        assertNotNull(testIncident.getTimeResolved());
        verify(incidentRepository).save(testIncident);
    }

    @Test
    void cancelIncident_Success() {
        when(incidentRepository.findIncidentById(1)).thenReturn(Optional.of(testIncident));

        Boolean result = incidentService.cancelIncident(1);

        assertTrue(result);
        verify(incidentRepository).deleteById(1);
    }

    @Test
    void cancelIncident_NotFound() {
        when(incidentRepository.findIncidentById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.cancelIncident(999));
    }

    @Test
    void getAcceptedIncidentsOrdered_Success() {
        when(incidentRepository.findAllAcceptedIncidentsOrderedBySeverityLevelAndTimeReported())
                .thenReturn(List.of(testIncident));
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        List<IncidentResponse> results = incidentService.getAcceptedIncidentsOrdered();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(incidentRepository).findAllAcceptedIncidentsOrderedBySeverityLevelAndTimeReported();
    }

    @Test
    void getResolvedIncidents_Success() {
        when(incidentRepository.findAllResolvedIncidents()).thenReturn(List.of(testIncident));
        when(incidentMapper.toResponse(testIncident)).thenReturn(testIncidentResponse);

        List<IncidentResponse> results = incidentService.getResolvedIncidents();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(incidentRepository).findAllResolvedIncidents();
    }
}