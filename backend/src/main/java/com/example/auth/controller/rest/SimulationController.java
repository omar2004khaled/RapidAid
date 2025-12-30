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

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startSimulation(@RequestParam int count) {
        // Trigger the simulation in the background
        simulationService.runSimulation(count, 60);
        Map<String, String> body = Map.of("message", "Simulation for " + count + " incidents started in the background.");
        return ResponseEntity.ok(body);
    }
}