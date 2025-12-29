package com.example.auth.controller.rest;

import com.example.auth.dto.AddressRequest;
import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.enums.ServiceType;
import com.example.auth.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/public/incident")
public class PublicIncidentController {

    @Autowired
    private IncidentService incidentService;

    @PostMapping("/report")
    public ResponseEntity<?> reportEmergency(@RequestBody Map<String, Object> request) {
        try {
            // Extract data from frontend format
            String incidentType = (String) request.get("incidentType");
            String description = (String) request.get("description");
            String reporterName = (String) request.get("reporterName");
            String reporterPhone = (String) request.get("reporterPhone");

            // Address data
            Map<String, Object> addressData = (Map<String, Object>) request.get("address");
            String street = (String) addressData.get("street");
            String city = (String) addressData.getOrDefault("city", "Cairo");
            String neighborhood = (String) addressData.getOrDefault("neighborhood", "Unknown");
            String buildingNo = (String) addressData.getOrDefault("buildingNo", "N/A");
            String apartmentNo = (String) addressData.getOrDefault("apartmentNo", "N/A");

            // Coordinates
            BigDecimal latitude = new BigDecimal(addressData.get("latitude").toString());
            BigDecimal longitude = new BigDecimal(addressData.get("longitude").toString());

            // Severity level
            Integer severityLevel = (Integer) request.getOrDefault("severityLevel", 3);

            // Create address request
            AddressRequest address = new AddressRequest();
            address.setStreet(street);
            address.setCity(city);
            address.setNeighborhood(neighborhood);
            address.setBuildingNo(buildingNo);
            address.setApartmentNo(apartmentNo);
            address.setLatitude(latitude);
            address.setLongitude(longitude);

            // Create incident request
            IncidentRequest incidentRequest = new IncidentRequest();
            incidentRequest.setIncidentType(ServiceType.valueOf(incidentType.toUpperCase()));
            incidentRequest.setAddress(address);
            incidentRequest.setSeverityLevel(severityLevel);
            incidentRequest.setLifeCycleStatus(com.example.auth.enums.IncidentStatus.REPORTED);
            incidentRequest.setDescription(description);

            // Create incident
            IncidentResponse response = incidentService.createIncident(incidentRequest);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Emergency reported successfully",
                    "incidentId", response.getIncidentId()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to report emergency: " + e.getMessage()));
        }
    }
}