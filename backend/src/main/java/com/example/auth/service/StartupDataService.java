package com.example.auth.service;

import com.example.auth.entity.Vehicle;
import com.example.auth.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StartupDataService implements ApplicationRunner {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleLocationService vehicleLocationService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("[STARTUP] Starting vehicle initialization...");
        initializeVehicleLocationsInRedis();
    }

    private void initializeVehicleLocationsInRedis() {
        try {
            System.out.println("[STARTUP] Fetching vehicles from database...");
            List<Vehicle> vehicles = vehicleRepository.findAll();
            System.out.println("[STARTUP] Found " + vehicles.size() + " vehicles in database");
            
            int count = 0;
            
            for (Vehicle vehicle : vehicles) {
                System.out.println("[STARTUP] Processing vehicle ID: " + vehicle.getVehicleId());
                BigDecimal lat = vehicle.getLastLatitude();
                BigDecimal lng = vehicle.getLastLongitude();
                
                // If no location set, use default Cairo area coordinates
                if (lat == null || lng == null) {
                    lat = new BigDecimal("30.0444").add(
                        BigDecimal.valueOf((Math.random() - 0.5) * 0.1)
                    );
                    lng = new BigDecimal("31.2357").add(
                        BigDecimal.valueOf((Math.random() - 0.5) * 0.1)
                    );
                    
                    vehicle.setLastLatitude(lat);
                    vehicle.setLastLongitude(lng);
                    vehicleRepository.save(vehicle);
                    System.out.println("[STARTUP] Updated vehicle " + vehicle.getVehicleId() + " with new coordinates");
                }
                
                vehicleLocationService.saveLocationToRedis(
                    vehicle.getVehicleId(), lat, lng
                );
                System.out.println("[STARTUP] Saved vehicle " + vehicle.getVehicleId() + " to Redis: " + lat + ", " + lng);
                count++;
            }
            
            System.out.println("✓ [STARTUP] Initialized " + count + " vehicles in Redis");
        } catch (Exception e) {
            System.err.println("[STARTUP] Failed to initialize vehicle locations: " + e.getMessage());
            e.printStackTrace();
        }
    }
}