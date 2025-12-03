package com.example.auth.controller.rest;

import com.example.auth.dto.AssignmentRequest;
import com.example.auth.dto.AssignmentResponse;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignment")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping("/all")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/enroute")
    public ResponseEntity<List<AssignmentResponse>> getEnrouteAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getEnrouteAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<AssignmentResponse>> getCompletedAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getCompletedAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByStatus(
            @RequestParam AssignmentStatus status
    ) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByStatus(status);
        return ResponseEntity.ok(assignments);
    }

    @PutMapping("/reassign")
    public ResponseEntity<AssignmentResponse> reassignAssignment(
            @RequestParam Integer assignmentId,
            @RequestParam Integer newVehicleId
    ) {
        AssignmentResponse reassignedAssignment = assignmentService.reassignAssignment(assignmentId, newVehicleId);
        return ResponseEntity.ok(reassignedAssignment);
    }

    @PutMapping("/update-status")
    public ResponseEntity<AssignmentResponse> updateAssignmentStatus(
            @RequestParam Integer assignmentId,
            @RequestParam AssignmentStatus status
    ) {
        AssignmentResponse updatedAssignment = assignmentService.updateAssignmentStatus(assignmentId, status);
        return ResponseEntity.ok(updatedAssignment);
    }

    @PostMapping("/assign")
    public ResponseEntity<AssignmentResponse> createAssignment(@RequestBody AssignmentRequest assignment) {
        AssignmentResponse createdAssignment = assignmentService.createAssignment(assignment);
        return ResponseEntity.ok(createdAssignment);
    }
}
