package com.example.auth.service;

import com.example.auth.config.DispatchAutomationConfig;
import com.example.auth.dto.AssignmentRequest;
import com.example.auth.entity.Incident;
import com.example.auth.entity.Vehicle;
import com.example.auth.enums.AssignmentStatus;
import com.example.auth.enums.ServiceType;
import com.example.auth.enums.VehicleType;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AutomatedDispatchingService {

    private final IncidentRepository incidentRepository;

    private final AssignmentService assignmentService;

    private final VehicleRepository vehicleRepository;

    private final DispatchAutomationConfig config;

    private final static int EARTH_RADIUS = 6371;

    @Value("${dispatch.automation.max-proximity-km}")
    private double searchRadiusKm;

    @Value("${dispatch.automation.main-admin-id}")
    private Long mainAdminId;

    record VehicleDistance(Vehicle vehicle, double dist) {
    }

    public static double distanceKm(
            double lat1, double lon1,
            double lat2, double lon2) {

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    @Transactional
    @Scheduled(fixedDelayString = "${dispatch.automation.interval-ms}")
    public void assignIncidents() {
        if (!config.isEnabled()) {
            return;
        }

        List<Incident> unassignedIncidents = incidentRepository.findAllReportedIncidentsSorted();

        if (unassignedIncidents.isEmpty()) {
            return;
        }

        List<Vehicle> policeVehicles = vehicleRepository.findAvailableByVehicleType(VehicleType.POLICE_CAR.name());
        List<Vehicle> fireVehicles = vehicleRepository.findAvailableByVehicleType(VehicleType.FIRE_TRUCK.name());
        List<Vehicle> medicalVehicles = vehicleRepository.findAvailableByVehicleType(VehicleType.AMBULANCE.name());

        Set<Integer> assignedVehicleIds = new HashSet<>();

        Map<ServiceType, List<Vehicle>> availableVehiclesMap = Map.of(
                ServiceType.POLICE, policeVehicles,
                ServiceType.FIRE, fireVehicles,
                ServiceType.MEDICAL, medicalVehicles
        );

        for (Incident incident : unassignedIncidents) {
            double lon = incident.getAddress().getLongitude().doubleValue();
            double lat = incident.getAddress().getLatitude().doubleValue();

            /*
            - Filters available vehicles by type
            - Filters out already assigned vehicles
            - Calculates distance to incident
            - Filters by search radius
            - Sorts by distance
            - Maps back to vehicle
             */
            List<Vehicle> candidates = availableVehiclesMap
                    .getOrDefault(incident.getIncidentType(), Collections.emptyList())
                    .stream()
                    .filter(v -> !assignedVehicleIds.contains(v.getVehicleId()))
                    .map(v -> new VehicleDistance(v, distanceKm(lat, lon,
                            v.getLastLatitude().doubleValue(),
                            v.getLastLongitude().doubleValue())))
                    .filter(pair -> pair.dist <= searchRadiusKm)
                    .sorted(Comparator.comparingDouble(VehicleDistance::dist))
                    .map(VehicleDistance::vehicle)
                    .toList();

            if (candidates.isEmpty()) {
                continue;
            }
            Integer vehicleId = candidates.get(0).getVehicleId();
            Integer incidentId = incident.getIncidentId();
            assignedVehicleIds.add(vehicleId);
            assignmentWrapper(vehicleId, incidentId, mainAdminId);
        }

    }

    @Transactional
    protected void assignmentWrapper(Integer vehicleId, Integer incidentId, Long mainAdminId) {
        AssignmentRequest assignmentRequest = new AssignmentRequest();
        assignmentRequest.setVehicleId(vehicleId);
        assignmentRequest.setIncidentId(incidentId);
        assignmentRequest.setAssignedByUserId(mainAdminId);
        assignmentRequest.setAssignmentStatus(AssignmentStatus.ASSIGNED);
        assignmentService.createAssignment(assignmentRequest);
    }
}
