package com.example.auth.controller.rest;

import com.example.auth.dto.VehicleResponse;

import java.math.BigDecimal;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Integer id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/update-status")
    public ResponseEntity<VehicleResponse> updateStatus(
            @RequestParam Integer vehicleId,
            @RequestParam VehicleStatus status
    ) {
        VehicleResponse updatedVehicle = vehicleService.updateStatus(vehicleId, status);
        return ResponseEntity.ok(updatedVehicle);
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByStatus(
            @RequestParam VehicleStatus status
    ) {
        List<VehicleResponse> vehicles = vehicleService.getVehiclesByStatus(status);
        return ResponseEntity.ok(vehicles);
    }

    @PutMapping("/{vehicleId}/location")
    public ResponseEntity<String> updateLocation(@PathVariable Integer vehicleId, 
                                               @RequestParam BigDecimal latitude, 
                                               @RequestParam BigDecimal longitude) {
        vehicleService.updateLocation(vehicleId, latitude, longitude);
        return ResponseEntity.ok("Vehicle location updated successfully");
    }
}
