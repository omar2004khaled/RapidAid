package com.example.auth.service;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Incident;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

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
}