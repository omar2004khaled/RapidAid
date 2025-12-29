package com.example.auth.controller.rest;

import com.example.auth.entity.Vehicle;
import com.example.auth.repository.VehicleRepository;
import com.example.auth.service.VehicleLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/test/vehicle-location")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class VehicleLocationTestController {

    @Autowired
    private VehicleLocationService vehicleLocationService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private VehicleRepository vehicleRepository;

    @PostMapping("/update/{vehicleId}")
    public ResponseEntity<?> updateLocation(
            @PathVariable Integer vehicleId,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude) {
        
        vehicleLocationService.saveLocationToRedis(vehicleId, latitude, longitude);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Location saved to Redis");
        response.put("vehicleId", vehicleId);
        response.put("latitude", latitude);
        response.put("longitude", longitude);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/redis/{vehicleId}")
    public ResponseEntity<?> getLocationFromRedis(@PathVariable Integer vehicleId) {
        String locationKey = "vehicle:location:" + vehicleId;
        String routeKey = "vehicle:route:" + vehicleId;
        
        Map<Object, Object> location = redisTemplate.opsForHash().entries(locationKey);
        Map<Object, Object> route = redisTemplate.opsForHash().entries(routeKey);
        
        Map<String, Object> response = new HashMap<>();
        
        if (!location.isEmpty()) {
            response.put("location", location);
        }
        
        if (!route.isEmpty()) {
            response.put("route", route);
        }
        
        if (response.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/redis/all")
    public ResponseEntity<?> getAllLocationsFromRedis() {
        try {
            // Get all vehicles from database and check their Redis data
            List<Vehicle> vehicles = vehicleRepository.findAll();
            Map<String, Object> allData = new HashMap<>();
            
            for (Vehicle vehicle : vehicles) {
                String locationKey = "vehicle:location:" + vehicle.getVehicleId();
                String routeKey = "vehicle:route:" + vehicle.getVehicleId();
                
                // Check if location exists in Redis
                if (redisTemplate.hasKey(locationKey)) {
                    Map<Object, Object> location = redisTemplate.opsForHash().entries(locationKey);
                    allData.put(locationKey, location);
                }
                
                // Check if route exists in Redis
                if (redisTemplate.hasKey(routeKey)) {
                    Map<Object, Object> route = redisTemplate.opsForHash().entries(routeKey);
                    allData.put(routeKey, route);
                }
            }
            
            return ResponseEntity.ok(allData);
        } catch (Exception e) {
            System.out.println("Error in getAllLocationsFromRedis: " + e.getMessage());
            return ResponseEntity.ok(new HashMap<>());
        }
    }

    @PostMapping("/start-assignment/{vehicleId}")
    public ResponseEntity<?> startAssignment(@PathVariable Integer vehicleId) {
        vehicleLocationService.saveLocationToRedis(vehicleId, new BigDecimal("30.0626"), new BigDecimal("31.2497"));
        vehicleLocationService.calculateAndStoreRoute(vehicleId, new BigDecimal("30.0444"), new BigDecimal("31.2357"));
        return ResponseEntity.ok(Map.of("message", "Assignment started for vehicle " + vehicleId));
    }

    @PostMapping("/init-all-vehicles")
    public ResponseEntity<?> initAllVehicles() {
        try {
            // Get all vehicles from database
            List<Vehicle> vehicles = vehicleRepository.findAll();
            int count = 0;
            
            for (Vehicle vehicle : vehicles) {
                if (vehicle.getLastLatitude() != null && vehicle.getLastLongitude() != null) {
                    vehicleLocationService.saveLocationToRedis(
                        vehicle.getVehicleId(),
                        vehicle.getLastLatitude(),
                        vehicle.getLastLongitude()
                    );
                    count++;
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Initialized " + count + " vehicles in Redis",
                "total", vehicles.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> forceSyncToDatabase() {
        vehicleLocationService.syncLocationsToDatabase();
        return ResponseEntity.ok(Map.of("message", "Sync completed"));
    }

    @GetMapping("/route/{vehicleId}")
    public ResponseEntity<?> getVehicleRoute(@PathVariable Integer vehicleId) {
        try {
            String routeKey = "vehicle:route:" + vehicleId;
            String routePointsStr = (String) redisTemplate.opsForHash().get(routeKey, "routePoints");
            
            if (routePointsStr == null) {
                return ResponseEntity.ok(Map.of("hasRoute", false));
            }
            
            List<Map<String, Double>> points = new ArrayList<>();
            String[] pointPairs = routePointsStr.split(";");
            for (String pointPair : pointPairs) {
                String[] coords = pointPair.split(",");
                if (coords.length == 2) {
                    points.add(Map.of(
                        "lat", Double.parseDouble(coords[0]),
                        "lng", Double.parseDouble(coords[1])
                    ));
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "hasRoute", true,
                "points", points
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("hasRoute", false));
        }
    }

    @PostMapping("/clear-redis")
    public ResponseEntity<?> clearRedisData() {
        try {
            Set<String> locationKeys = redisTemplate.keys("vehicle:location:*");
            Set<String> routeKeys = redisTemplate.keys("vehicle:route:*");
            
            int deletedCount = 0;
            for (String key : locationKeys) {
                redisTemplate.delete(key);
                deletedCount++;
            }
            for (String key : routeKeys) {
                redisTemplate.delete(key);
                deletedCount++;
            }
            
            return ResponseEntity.ok(Map.of("message", "Cleared " + deletedCount + " Redis keys"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{vehicleId}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Integer vehicleId) {
        try {
            String locationKey = "vehicle:location:" + vehicleId;
            String routeKey = "vehicle:route:" + vehicleId;
            redisTemplate.delete(locationKey);
            redisTemplate.delete(routeKey);
            vehicleRepository.deleteById(vehicleId);
            return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/redis/debug")
    public ResponseEntity<?> debugRedisKeys() {
        Set<String> allKeys = redisTemplate.keys("*");
        return ResponseEntity.ok(Map.of("allKeys", allKeys));
    }

    @GetMapping("/redis/test")
    public ResponseEntity<?> testRedis() {
        try {
            // Test basic operations
            redisTemplate.opsForValue().set("test:key", "test-value");
            String value = (String) redisTemplate.opsForValue().get("test:key");
            
            // Test hash operations (like vehicle locations)
            redisTemplate.opsForHash().put("vehicle:location:999", "latitude", "30.0444");
            redisTemplate.opsForHash().put("vehicle:location:999", "longitude", "31.2357");
            
            // Check if hash exists
            Boolean hashExists = redisTemplate.hasKey("vehicle:location:999");
            Map<Object, Object> hashData = redisTemplate.opsForHash().entries("vehicle:location:999");
            
            // Try different key patterns
            Set<String> allKeys = redisTemplate.keys("*");
            Set<String> testKeys = redisTemplate.keys("test:*");
            Set<String> vehicleKeys = redisTemplate.keys("vehicle:*");
            
            return ResponseEntity.ok(Map.of(
                "setValue", "test-value",
                "getValue", value,
                "hashExists", hashExists,
                "hashData", hashData,
                "allKeys", allKeys,
                "testKeys", testKeys,
                "vehicleKeys", vehicleKeys
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }
}