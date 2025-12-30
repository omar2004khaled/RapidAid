package com.example.auth.service;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Vehicle;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class VehicleLocationService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private RoutingService routingService;

    private static final String LOCATION_KEY_PREFIX = "vehicle:location:";
    private static final String ROUTE_KEY_PREFIX = "vehicle:route:";

    public void saveLocationToRedis(Integer vehicleId, BigDecimal latitude, BigDecimal longitude) {
        String key = LOCATION_KEY_PREFIX + vehicleId;
        redisTemplate.opsForHash().put(key, "latitude", latitude.toPlainString());
        redisTemplate.opsForHash().put(key, "longitude", longitude.toPlainString());
        redisTemplate.opsForHash().put(key, "timestamp", LocalDateTime.now().toString());
    }

    @Transactional
    @Scheduled(fixedRate = 30000) 
    public void syncLocationsToDatabase() {
        Set<String> keys = redisTemplate.keys(LOCATION_KEY_PREFIX + "*");
        
        for (String key : keys) {
            try {
                Integer vehicleId = Integer.valueOf(key.replace(LOCATION_KEY_PREFIX, ""));
                Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
                if (vehicle == null) continue;
                saveVehicleLocationToDatabase(vehicle);
            } catch (Exception e) {
            }
        }
    }

    @org.springframework.beans.factory.annotation.Value("${vehicle.simulation.speed-factor:1.0}")
    private double simulationSpeedFactor;
    @Transactional
    public void saveVehicleLocationToDatabase(Vehicle vehicle) {
        String key = LOCATION_KEY_PREFIX + vehicle.getVehicleId();
        String latStr = (String) redisTemplate.opsForHash().get(key, "latitude");
        String lngStr = (String) redisTemplate.opsForHash().get(key, "longitude");

        vehicle.setLastLatitude(new BigDecimal(latStr));
        vehicle.setLastLongitude(new BigDecimal(lngStr));
        vehicle.setLastUpdatedTime(LocalDateTime.now());
        vehicleRepository.save(vehicle);
    }

    public void calculateAndStoreRoute(Integer vehicleId, BigDecimal targetLat, BigDecimal targetLng) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            System.out.println("Vehicle not found: " + vehicleId);
            return;
        }
        
        // Initialize vehicle location if not set
        if (vehicle.getLastLatitude() == null || vehicle.getLastLongitude() == null) {
            vehicle.setLastLatitude(new BigDecimal("30.0626"));
            vehicle.setLastLongitude(new BigDecimal("31.2497"));
            vehicleRepository.save(vehicle);
            System.out.println("Initialized vehicle " + vehicleId + " location");
        }

        try {
            RoutingService.RouteResult route = routingService.findRouteForVehicle(vehicle, targetLat, targetLng);
            String routeKey = ROUTE_KEY_PREFIX + vehicleId;
            
            // Apply Speed Factor: Divide real time by factor (e.g., 100s / 10 = 10s simulation time)
            double adjustedTime = route.getTimeSeconds() / simulationSpeedFactor;

            // Store route points and metadata
            redisTemplate.opsForHash().put(routeKey, "totalTime", String.valueOf(adjustedTime));
            redisTemplate.opsForHash().put(routeKey, "startTime", LocalDateTime.now().toString());
            
            // Store route points as JSON-like string
            StringBuilder pointsStr = new StringBuilder();
            for (int i = 0; i < route.getPoints().size(); i++) {
                RoutingService.RoutePoint point = route.getPoints().get(i);
                if (i > 0) pointsStr.append(";");
                pointsStr.append(point.getLatitude()).append(",").append(point.getLongitude());
            }
            redisTemplate.opsForHash().put(routeKey, "routePoints", pointsStr.toString());
            
            System.out.println("Route stored for vehicle " + vehicleId + ", points: " + route.getPoints().size() + ", time: " + adjustedTime + "s (Speed Factor: " + simulationSpeedFactor + "x)");
        } catch (Exception e) {
            System.out.println("Route calculation failed: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 3500) // Update every 5 seconds
    public void updateVehiclePositionsAlongRoute() {
        try {
            // Get all vehicles from database and check if they have routes
            List<Vehicle> vehicles = vehicleRepository.findAll();
            
            for (Vehicle vehicle : vehicles) {
                String routeKey = ROUTE_KEY_PREFIX + vehicle.getVehicleId();
                if (redisTemplate.hasKey(routeKey)) {
                    updateVehicleAlongRoute(routeKey);
                    System.out.println("Updated position for vehicle " + vehicle.getVehicleId());
                }
            }
        } catch (Exception e) {
            System.out.println("Error updating vehicle positions: " + e.getMessage());
        }
    }

    private void updateVehicleAlongRoute(String routeKey) {
        Integer vehicleId = Integer.valueOf(routeKey.replace(ROUTE_KEY_PREFIX, ""));
        
        String startTimeStr = (String) redisTemplate.opsForHash().get(routeKey, "startTime");
        String totalTimeStr = (String) redisTemplate.opsForHash().get(routeKey, "totalTime");
        String routePointsStr = (String) redisTemplate.opsForHash().get(routeKey, "routePoints");
        
        if (startTimeStr == null || totalTimeStr == null || routePointsStr == null) {
            return;
        }

        LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
        double totalTime = Double.parseDouble(totalTimeStr);
        
        long elapsedSeconds = java.time.Duration.between(startTime, LocalDateTime.now()).getSeconds();
        
        // Calculate progress (0.0 to 1.0)
        double progress = Math.min(1.0, elapsedSeconds / totalTime);
        
        // Parse route points
        String[] pointPairs = routePointsStr.split(";");
        if (pointPairs.length < 2) {
            return;
        }
        
        // Find current position along the route
        double routeProgress = progress * (pointPairs.length - 1);
        int currentSegment = (int) Math.floor(routeProgress);
        double segmentProgress = routeProgress - currentSegment;
        
        if (currentSegment >= pointPairs.length - 1) {
            // At the end of route
            String[] endPoint = pointPairs[pointPairs.length - 1].split(",");
            saveLocationToRedis(vehicleId, new BigDecimal(endPoint[0]), new BigDecimal(endPoint[1]));
        } else {
            // Interpolate between current segment points
            String[] fromPoint = pointPairs[currentSegment].split(",");
            String[] toPoint = pointPairs[currentSegment + 1].split(",");
            
            double fromLat = Double.parseDouble(fromPoint[0]);
            double fromLng = Double.parseDouble(fromPoint[1]);
            double toLat = Double.parseDouble(toPoint[0]);
            double toLng = Double.parseDouble(toPoint[1]);
            
            double currentLat = fromLat + (toLat - fromLat) * segmentProgress;
            double currentLng = fromLng + (toLng - fromLng) * segmentProgress;
            
            saveLocationToRedis(vehicleId, BigDecimal.valueOf(currentLat), BigDecimal.valueOf(currentLng));
        }
        
        // Check if arrived (progress >= 1.0)
        if (progress >= 1.0) {
            redisTemplate.delete(routeKey);
            handleVehicleArrival(vehicleId);
        }
    }

    public boolean hasVehicleReachedDestination(Integer vehicleId) {
        String routeKey = ROUTE_KEY_PREFIX + vehicleId;
        return !redisTemplate.hasKey(routeKey);
    }

    private void handleVehicleArrival(Integer vehicleId) {
        // Sync current Redis position to database immediately
        syncVehicleLocationToDatabase(vehicleId);
        
        List<Assignment> activeAssignments = assignmentRepository
            .findByVehicleVehicleIdAndAssignmentStatusNot(vehicleId, "COMPLETED");
        
        for (Assignment assignment : activeAssignments) {
            assignment.setArrived();
            assignmentRepository.save(assignment);
        }
    }
    
    private void syncVehicleLocationToDatabase(Integer vehicleId) {
        String key = LOCATION_KEY_PREFIX + vehicleId;
        String latStr = (String) redisTemplate.opsForHash().get(key, "latitude");
        String lngStr = (String) redisTemplate.opsForHash().get(key, "longitude");
        
        if (latStr != null && lngStr != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
            if (vehicle != null) {
                vehicle.setLastLatitude(new BigDecimal(latStr));
                vehicle.setLastLongitude(new BigDecimal(lngStr));
                vehicle.setLastUpdatedTime(LocalDateTime.now());
                vehicleRepository.save(vehicle);
            }
        }
    }
}