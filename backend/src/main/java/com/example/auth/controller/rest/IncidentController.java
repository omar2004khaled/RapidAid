package com.example.auth.controller.rest;

import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.service.IncidentService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incident")
@Tag(name = "Incident Management", description = "Emergency incident reporting and management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @Operation(
            summary = "Get accepted incidents",
            description = "Retrieves all incidents that have been accepted by admin, ordered by priority, creation date."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved accepted incidents",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/accepted-incidents")
    public ResponseEntity<List<IncidentResponse>> getReportedIncidents() {
        List<IncidentResponse> incidents = incidentService.getAcceptedIncidentsOrdered();
        return ResponseEntity.ok(incidents);
    }

    @Operation(
            summary = "Get reported incidents",
            description = "Retrieves all newly reported incidents that are waiting for admin review."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved reported incidents",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            )
    })
    @GetMapping("/reported-incidents")
    public ResponseEntity<List<IncidentResponse>> getAcceptedIncidents() {
        List<IncidentResponse> incidents = incidentService.getReportedIncidents();
        return ResponseEntity.ok(incidents);
    }

    @Operation(
            summary = "Get all incidents",
            description = "Retrieves all incidents in the system regardless of status."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved all incidents",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            )
    })
    @GetMapping("/all-incidents")
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        List<IncidentResponse> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    @Operation(
            summary = "Get resolved incidents",
            description = "Retrieves all incidents that have been marked as resolved."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved resolved incidents",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            )
    })
    @GetMapping("/resolved-incidents")
    public ResponseEntity<List<IncidentResponse>> getResolvedIncidents() {
        List<IncidentResponse> incidents = incidentService.getResolvedIncidents();
        return ResponseEntity.ok(incidents);
    }

    @Operation(
            summary = "Create new incident",
            description = "Creates a new emergency incident report. Used by reporters to submit emergencies."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incident created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - validation error")
    })
    @PostMapping("/create-incident")
    public ResponseEntity<IncidentResponse> createIncident(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Incident details",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = IncidentRequest.class),
                            examples = @ExampleObject(value = """
                                    {
                                        "type": "FIRE",
                                        "description": "Building fire on 5th floor",
                                        "latitude": 30.0444,
                                        "longitude": 31.2357,
                                        "reporterId": 1
                                    }
                                    """)
                    )
            )
            @RequestBody IncidentRequest incidentRequest) {
        IncidentResponse createdIncident = incidentService.createIncident(incidentRequest);
        return ResponseEntity.ok(createdIncident);
    }

    @Operation(
            summary = "Get incident by ID",
            description = "Retrieves detailed information about a specific incident."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved incident",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @PathVariable Integer id) {
        IncidentResponse incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(incident);
    }

    @Operation(
            summary = "Update incident priority",
            description = "Updates the priority level of an incident (1-5, where 1 is highest priority)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Priority updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @PutMapping("/update-priority")
    public ResponseEntity<IncidentResponse> updatePriority(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @RequestParam Integer incidentId,
            @Parameter(description = "Priority level (1-5)", required = true, example = "1")
            @RequestParam Integer priority
    ) {
        IncidentResponse updatedIncident = incidentService.updatePriority(incidentId, priority);
        return ResponseEntity.ok(updatedIncident);
    }

    @Operation(
            summary = "Accept incident",
            description = "Marks an incident as accepted by an admin, moving it from reported to active status."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incident accepted successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @PutMapping("/update-to-accepted")
    public ResponseEntity<IncidentResponse> updateToAccepted(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @RequestParam Integer incidentId) {
        IncidentResponse updatedIncident = incidentService.updateToAccepted(incidentId);
        return ResponseEntity.ok(updatedIncident);
    }

    @Operation(
            summary = "Resolve incident",
            description = "Marks an incident as resolved, indicating the emergency has been handled."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incident resolved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = IncidentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @PutMapping("/update-to-resolved")
    public ResponseEntity<IncidentResponse> updateToResolved(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @RequestParam Integer incidentId) {
        IncidentResponse updatedIncident = incidentService.updateToResolved(incidentId);
        return ResponseEntity.ok(updatedIncident);
    }

    @Operation(
            summary = "Cancel incident",
            description = "Cancels an incident report. Returns true if successfully cancelled."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incident cancelled successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Boolean.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelIncident(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @PathVariable Integer id) {
        Boolean cancelStatus = incidentService.cancelIncident(id);
        return ResponseEntity.ok(cancelStatus);
    }

    @Operation(
            summary = "Update incident status",
            description = "Updates the lifecycle status of an incident."
    )
    @PutMapping("/update-status/{id}")
    public ResponseEntity<IncidentResponse> updateIncidentStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        try {
            IncidentResponse updatedIncident;
            switch (status.toUpperCase()) {
                case "ACCEPTED":
                    updatedIncident = incidentService.updateToAccepted(id);
                    break;
                case "RESOLVED":
                    updatedIncident = incidentService.updateToResolved(id);
                    break;
                case "CANCELLED":
                    incidentService.cancelIncident(id);
                    return ResponseEntity.ok().build();
                default:
                    return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(updatedIncident);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @Operation(
            summary = "Delete incident",
            description = "Permanently deletes an incident from the system."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Incident deleted successfully"
            ),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteIncident(
            @Parameter(description = "Incident ID", required = true, example = "1")
            @PathVariable Integer id) {
        try {
            incidentService.deleteIncident(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
