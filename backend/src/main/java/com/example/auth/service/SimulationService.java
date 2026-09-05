package com.example.auth.service;

import com.example.auth.dto.AddressRequest;
import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.VehicleRequest;
import com.example.auth.enums.IncidentStatus;
import com.example.auth.enums.ServiceType;
import com.example.auth.enums.VehicleStatus;
import com.example.auth.enums.VehicleType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

@Service
public class SimulationService {

    private static final Logger logger = LoggerFactory.getLogger(SimulationService.class);

    @Value("${jmeter.bin.path:}")
    private String jmeterPath;

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private VehicleService vehicleService;

    // Cairo simulation anchor locations
    private static final double[][] CAIRO_NEIGHBORHOODS = {
        {30.0570, 31.3400}, // Nasr City
        {29.9600, 31.2600}, // Maadi
        {30.0444, 31.2357}, // Downtown Cairo
        {30.0900, 31.3200}, // Heliopolis
        {30.0150, 31.4350}, // New Cairo / 5th Settlement
        {30.0380, 31.2120}, // Dokki
        {30.0600, 31.2200}  // Zamalek
    };

    private static final String[] NEIGHBORHOOD_NAMES = {
        "Nasr City", "Maadi", "Downtown", "Heliopolis", "New Cairo", "Dokki", "Zamalek"
    };

    private static final String[] STREET_NAMES = {
        "Abbas El Akkad", "El Tahrir St", "Corniche El Nil", "90th Street", "El Merghany", "Ramses St", "Gezira St"
    };

    public CompletableFuture<String> addIncidentsSimulation(int totalIncidents, int durationSeconds) {
        return CompletableFuture.supplyAsync(() -> {
            File jmeterExec = (jmeterPath != null && !jmeterPath.isBlank()) ? new File(jmeterPath) : null;
            if (jmeterExec != null && jmeterExec.exists() && jmeterExec.canExecute()) {
                return runJmeterIncidents(totalIncidents);
            }

            logger.info("JMeter not available; executing built-in direct incident simulation for {} incidents...", totalIncidents);
            return runDirectIncidentsSimulation(totalIncidents);
        });
    }

    public CompletableFuture<String> addVehiclesSimulation(int totalVehicles, int durationSeconds) {
        return CompletableFuture.supplyAsync(() -> {
            File jmeterExec = (jmeterPath != null && !jmeterPath.isBlank()) ? new File(jmeterPath) : null;
            if (jmeterExec != null && jmeterExec.exists() && jmeterExec.canExecute()) {
                return runJmeterVehicles(totalVehicles);
            }

            logger.info("JMeter not available; executing built-in direct vehicle simulation for {} vehicles...", totalVehicles);
            return runDirectVehiclesSimulation(totalVehicles);
        });
    }

    private String runDirectIncidentsSimulation(int count) {
        Random random = new Random();
        ServiceType[] types = ServiceType.values();
        int created = 0;

        for (int i = 0; i < count; i++) {
            try {
                int neighborhoodIndex = random.nextInt(CAIRO_NEIGHBORHOODS.length);
                double baseLat = CAIRO_NEIGHBORHOODS[neighborhoodIndex][0];
                double baseLng = CAIRO_NEIGHBORHOODS[neighborhoodIndex][1];

                // Add jitter (+/- ~1.5km)
                double lat = baseLat + (random.nextDouble() - 0.5) * 0.025;
                double lng = baseLng + (random.nextDouble() - 0.5) * 0.025;

                ServiceType type = types[random.nextInt(types.length)];
                int severity = random.nextInt(5) + 1;

                AddressRequest address = new AddressRequest();
                address.setCity("Cairo");
                address.setNeighborhood(NEIGHBORHOOD_NAMES[neighborhoodIndex]);
                address.setStreet(STREET_NAMES[random.nextInt(STREET_NAMES.length)]);
                address.setBuildingNo(String.valueOf(random.nextInt(120) + 1));
                address.setApartmentNo(String.valueOf(random.nextInt(30) + 1));
                address.setLatitude(BigDecimal.valueOf(lat).setScale(6, RoundingMode.HALF_UP));
                address.setLongitude(BigDecimal.valueOf(lng).setScale(6, RoundingMode.HALF_UP));

                IncidentRequest req = new IncidentRequest();
                req.setIncidentType(type);
                req.setReportedByUserId(1);
                req.setSeverityLevel(severity);
                req.setLifeCycleStatus(IncidentStatus.REPORTED);
                req.setDescription("Simulated " + type + " emergency near " + address.getStreet() + ", " + address.getNeighborhood());
                req.setAddress(address);

                incidentService.createIncident(req);
                created++;

                // Small pacing pause (150ms) to allow visual streaming
                Thread.sleep(150);
            } catch (Exception e) {
                logger.error("Error creating simulated incident #{}: {}", i, e.getMessage());
            }
        }

        return "Successfully created " + created + " simulated incidents";
    }

    private String runDirectVehiclesSimulation(int count) {
        Random random = new Random();
        VehicleType[] types = VehicleType.values();
        int created = 0;

        for (int i = 0; i < count; i++) {
            try {
                int neighborhoodIndex = random.nextInt(CAIRO_NEIGHBORHOODS.length);
                double baseLat = CAIRO_NEIGHBORHOODS[neighborhoodIndex][0];
                double baseLng = CAIRO_NEIGHBORHOODS[neighborhoodIndex][1];

                double lat = baseLat + (random.nextDouble() - 0.5) * 0.03;
                double lng = baseLng + (random.nextDouble() - 0.5) * 0.03;

                VehicleType type = types[random.nextInt(types.length)];
                String regNumber = type.name().substring(0, 3) + "-" + (1000 + random.nextInt(9000));

                VehicleRequest req = new VehicleRequest();
                req.setRegistrationNumber(regNumber);
                req.setVehicleType(type);
                req.setCapacity(4);
                req.setStatus(VehicleStatus.AVAILABLE);
                req.setLastLatitude(BigDecimal.valueOf(lat).setScale(6, RoundingMode.HALF_UP));
                req.setLastLongitude(BigDecimal.valueOf(lng).setScale(6, RoundingMode.HALF_UP));

                vehicleService.createVehicle(req);
                created++;

                Thread.sleep(150);
            } catch (Exception e) {
                logger.error("Error creating simulated vehicle #{}: {}", i, e.getMessage());
            }
        }

        return "Successfully created " + created + " simulated vehicles";
    }

    private String runJmeterIncidents(int totalIncidents) {
        try {
            String projectDir = System.getProperty("user.dir");
            String scriptPath = projectDir + File.separator + "Create_Incidents.jmx";
            String logPath = projectDir + File.separator + "results_i.jtl";

            int threads = Math.min(totalIncidents, 50);
            while (threads > 1 && totalIncidents % threads != 0) {
                threads--;
            }
            int loops = totalIncidents / threads;

            ProcessBuilder processBuilder = new ProcessBuilder(
                jmeterPath, "-n", "-t", scriptPath, "-l", logPath,
                "-Jusers=" + threads, "-Jloops=" + loops
            );

            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[JMeter]: " + line);
                }
            }

            int exitCode = process.waitFor();
            return (exitCode == 0) ? "JMeter Simulation Completed" : "JMeter Simulation Failed";
        } catch (Exception e) {
            logger.error("JMeter incident execution error", e);
            return "Error: " + e.getMessage();
        }
    }

    private String runJmeterVehicles(int totalVehicles) {
        try {
            String projectDir = System.getProperty("user.dir");
            String scriptPath = projectDir + File.separator + "Create_Vehicles.jmx";
            String logPath = projectDir + File.separator + "results_v.jtl";

            int threads = Math.min(totalVehicles, 50);
            while (threads > 1 && totalVehicles % threads != 0) {
                threads--;
            }
            int loops = totalVehicles / threads;

            ProcessBuilder processBuilder = new ProcessBuilder(
                jmeterPath, "-n", "-t", scriptPath, "-l", logPath,
                "-Jusers=" + threads, "-Jloops=" + loops
            );

            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[JMeter]: " + line);
                }
            }

            int exitCode = process.waitFor();
            return (exitCode == 0) ? "JMeter Simulation Completed" : "JMeter Simulation Failed";
        } catch (Exception e) {
            logger.error("JMeter vehicle execution error", e);
            return "Error: " + e.getMessage();
        }
    }
}
