package com.example.auth.controller.rest;

import com.example.auth.dto.AnalyticsDTO;
import com.example.auth.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Performance metrics and reporting endpoints")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get system performance metrics", description = "Returns average response, arrival, and resolution times.")
    @GetMapping("/performance-metrics")
    public ResponseEntity<AnalyticsDTO.PerformanceMetrics> getPerformanceMetrics() {
        return ResponseEntity.ok(analyticsService.getSystemPerformanceMetrics());
    }

    @Operation(summary = "Get daily response time trend", description = "Returns average response times per day for the last N days.")
    @GetMapping("/response-time-trend")
    public ResponseEntity<List<AnalyticsDTO.ResponseTimeTrend>> getResponseTimeTrend(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getDailyResponseTimeTrend(days));
    }

    @Operation(summary = "Get top performing units", description = "Returns top performing vehicles based on completion count and average time.")
    @GetMapping("/top-units")
    public ResponseEntity<List<AnalyticsDTO.TopUnitPerformance>> getTopPerformingUnits(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getTopPerformingUnits(limit));
    }
}
