package com.example.auth.controller.rest;

import com.example.auth.dto.AssignmentRequest;
import com.example.auth.dto.AssignmentResponse;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignment")
@Tag(name = "Assignment Management", description = "Vehicle-to-incident assignment and tracking endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Operation(
            summary = "Get all assignments",
            description = "Retrieves all vehicle-to-incident assignments in the system."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved assignments",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            )
    })
    @GetMapping("/all")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }

    @Operation(
            summary = "Get enroute assignments",
            description = "Retrieves all assignments where vehicles are currently enroute to incidents."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved enroute assignments",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            )
    })
    @GetMapping("/enroute")
    public ResponseEntity<List<AssignmentResponse>> getEnrouteAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getEnrouteAssignments();
        return ResponseEntity.ok(assignments);
    }

    @Operation(
            summary = "Get completed assignments",
            description = "Retrieves all assignments that have been marked as completed."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved completed assignments",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            )
    })
    @GetMapping("/completed")
    public ResponseEntity<List<AssignmentResponse>> getCompletedAssignments() {
        List<AssignmentResponse> assignments = assignmentService.getCompletedAssignments();
        return ResponseEntity.ok(assignments);
    }

    @Operation(
            summary = "Get assignments by status",
            description = "Retrieves all assignments with a specific status (PENDING, ACCEPTED, ENROUTE, COMPLETED, CANCELLED)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved assignments",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            )
    })
    @GetMapping("/by-status")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByStatus(
            @Parameter(description = "Assignment status to filter by", required = true, example = "ENROUTE")
            @RequestParam AssignmentStatus status
    ) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByStatus(status);
        return ResponseEntity.ok(assignments);
    }

    @Operation(
            summary = "Reassign assignment to different vehicle",
            description = "Changes the assigned vehicle for an existing assignment. Used when the original vehicle becomes unavailable."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Assignment reassigned successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Assignment or vehicle not found")
    })
    @PutMapping("/reassign")
    public ResponseEntity<AssignmentResponse> reassignAssignment(
            @Parameter(description = "Assignment ID to reassign", required = true, example = "1")
            @RequestParam Integer assignmentId,
            @Parameter(description = "New vehicle ID", required = true, example = "2")
            @RequestParam Integer newVehicleId
    ) {
        AssignmentResponse reassignedAssignment = assignmentService.reassignAssignment(assignmentId, newVehicleId);
        return ResponseEntity.ok(reassignedAssignment);
    }

    @Operation(
            summary = "Update assignment status",
            description = "Updates the current status of an assignment (PENDING, ACCEPTED, ENROUTE, COMPLETED, CANCELLED)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Status updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @PutMapping("/update-status")
    public ResponseEntity<AssignmentResponse> updateAssignmentStatus(
            @Parameter(description = "Assignment ID", required = true, example = "1")
            @RequestParam Integer assignmentId,
            @Parameter(description = "New assignment status", required = true, example = "ENROUTE")
            @RequestParam AssignmentStatus status
    ) {
        AssignmentResponse updatedAssignment = assignmentService.updateAssignmentStatus(assignmentId, status);
        return ResponseEntity.ok(updatedAssignment);
    }

    @Operation(
            summary = "Create new assignment",
            description = "Assigns a vehicle to an incident. Used by dispatchers to send responders to emergencies."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Assignment created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AssignmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - validation error")
    })
    @PostMapping("/assign")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Assignment details",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AssignmentRequest.class),
                            examples = @ExampleObject(value = """
                                    {
                                        "incidentId": 1,
                                        "vehicleId": 1,
                                        "dispatcherId": 2
                                    }
                                    """)
                    )
            )
            @RequestBody AssignmentRequest assignment) {
        AssignmentResponse createdAssignment = assignmentService.createAssignment(assignment);
        return ResponseEntity.ok(createdAssignment);
    }

    @Operation(
            summary = "Complete assignment",
            description = "Marks an assignment as completed when responders finish handling the incident."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Assignment completed successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"Assignment completed successfully\"")
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @PutMapping("/{assignmentId}/complete")
    public ResponseEntity<String> completeAssignment(
            @Parameter(description = "Assignment ID", required = true, example = "1")
            @PathVariable Integer assignmentId) {
        assignmentService.updateAssignmentStatus(assignmentId, AssignmentStatus.COMPLETED);
        return ResponseEntity.ok("Assignment completed successfully");
    }

    @Operation(
            summary = "Accept assignment",
            description = "Allows a responder to accept an assignment that was dispatched to their vehicle."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Assignment accepted successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"Assignment accepted successfully\"")
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Assignment or responder not found")
    })
    @PostMapping("/{assignmentId}/accept")
    public ResponseEntity<String> acceptAssignment(
            @Parameter(description = "Assignment ID", required = true, example = "1")
            @PathVariable Integer assignmentId,
            @Parameter(description = "Responder user ID", required = true, example = "3")
            @RequestParam Long responderId
    ) {
        assignmentService.acceptAssignment(assignmentId, responderId);
        return ResponseEntity.ok("Assignment accepted successfully");
    }
}
