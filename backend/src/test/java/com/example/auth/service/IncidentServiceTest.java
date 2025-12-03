package com.example.auth.service;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentService incidentService;

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
}