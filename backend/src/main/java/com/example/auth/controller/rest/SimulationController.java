package com.example.auth.controller.rest;
import com.example.auth.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    @Autowired
    private SimulationService simulationService;

    @PostMapping("/incidents")
    public ResponseEntity<Map<String, String>> IncidentsSimulation(@RequestParam int count) {
        // Trigger the simulation in the background
        simulationService.addIncidentsSimulation(count, 60);
        Map<String, String> body = Map.of("message", "Simulation for " + count + " incidents started in the background.");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Map<String, String>> vehiclesSimulation(@RequestParam int count) {
        // Trigger the simulation in the background
        simulationService.addVehiclesSimulation(count, 60);
        Map<String, String> body = Map.of("message", "Simulation for " + count + " vehicles started in the background.");
        return ResponseEntity.ok(body);
    }




}