package com.example.auth.controller.rest;

import com.example.auth.entity.Assignment;
import com.example.auth.entity.Vehicle;
import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.VehicleRepository;
import com.example.auth.service.VehicleAssignmentService;
import com.example.auth.service.VehicleLocationService;
import com.example.auth.service.RoutingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/debug")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class DebugController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private VehicleLocationService vehicleLocationService;

    @Autowired
    private VehicleAssignmentService vehicleAssignmentService;

    @Autowired
    private RoutingService routingService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/vehicles-db")
    public ResponseEntity<?> getVehiclesFromDB() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return ResponseEntity.ok(Map.of(
            "count", vehicles.size(),
            "vehicles", vehicles
        ));
    }

    @GetMapping("/vehicles-redis")
    public ResponseEntity<?> getVehiclesFromRedis() {
        Set<String> keys = redisTemplate.keys("vehicle:location:*");
        Map<String, Object> redisData = new HashMap<>();
        
        for (String key : keys) {
            Map<Object, Object> location = redisTemplate.opsForHash().entries(key);
            redisData.put(key, location);
        }
        
        return ResponseEntity.ok(Map.of(
            "count", keys.size(),
            "keys", keys,
            "data", redisData
        ));
    }

    @PostMapping("/force-load-redis")
    public ResponseEntity<?> forceLoadRedis() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        int loaded = 0;
        
        for (Vehicle vehicle : vehicles) {
            BigDecimal lat = vehicle.getLastLatitude();
            BigDecimal lng = vehicle.getLastLongitude();
            
            if (lat == null || lng == null) {
                lat = new BigDecimal("30.0444").add(BigDecimal.valueOf((Math.random() - 0.5) * 0.1));
                lng = new BigDecimal("31.2357").add(BigDecimal.valueOf((Math.random() - 0.5) * 0.1));
                vehicle.setLastLatitude(lat);
                vehicle.setLastLongitude(lng);
                vehicleRepository.save(vehicle);
            }
            
            vehicleLocationService.saveLocationToRedis(vehicle.getVehicleId(), lat, lng);
            loaded++;
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "Force loaded vehicles to Redis",
            "loaded", loaded,
            "total", vehicles.size()
        ));
    }

    @GetMapping("/redis-test")
    public ResponseEntity<?> testRedis() {
        try {
            redisTemplate.opsForValue().set("test:key", "test-value");
            String value = (String) redisTemplate.opsForValue().get("test:key");
            redisTemplate.delete("test:key");
            
            return ResponseEntity.ok(Map.of(
                "redis_working", true,
                "test_value", value
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "redis_working", false,
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll();
        return ResponseEntity.ok(Map.of(
            "count", assignments.size(),
            "assignments", assignments
        ));
    }

    @PostMapping("/process-assignments")
    public ResponseEntity<?> processAssignments() {
        try {
            vehicleAssignmentService.processVehicleAssignments();
            return ResponseEntity.ok(Map.of(
                "message", "Assignment processing triggered",
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Assignment processing failed: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping("/vehicle-routes")
    public ResponseEntity<?> getVehicleRoutes() {
        Set<String> routeKeys = redisTemplate.keys("vehicle:route:*");
        Map<String, Object> routes = new HashMap<>();
        
        for (String key : routeKeys) {
            Map<Object, Object> route = redisTemplate.opsForHash().entries(key);
            routes.put(key, route);
        }
        
        return ResponseEntity.ok(Map.of(
            "count", routeKeys.size(),
            "routes", routes
        ));
    }

    @GetMapping("/test-routing")
    public ResponseEntity<?> testRouting() {
        try {
            // Test route from Cairo center to Giza
            BigDecimal fromLat = new BigDecimal("30.0444");
            BigDecimal fromLng = new BigDecimal("31.2357");
            BigDecimal toLat = new BigDecimal("30.0131");
            BigDecimal toLng = new BigDecimal("31.2089");
            
            RoutingService.RouteResult route = routingService.findRoute(fromLat, fromLng, toLat, toLng);
            
            return ResponseEntity.ok(Map.of(
                "routing_working", true,
                "distance_km", route.getDistanceKm(),
                "time_seconds", route.getTimeSeconds(),
                "points_count", route.getPoints().size()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "routing_working", false,
                "error", e.getMessage(),
                "error_type", e.getClass().getSimpleName()
            ));
        }
    }
}