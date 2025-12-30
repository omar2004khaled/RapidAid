package com.example.auth.service;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.util.concurrent.CompletableFuture;

@Service
public class SimulationService {

    @Value("${jmeter.bin.path}")
    private String jmeterPath;

    // Run this asynchronously so it doesn't block your main server thread
    public CompletableFuture<String> runSimulation(int totalIncidents, int durationSeconds) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 2. Dynamic Script Path: 
                // Getting "user.dir" automatically finds the project root folder
                String projectDir = System.getProperty("user.dir");
                String scriptPath = projectDir + File.separator + "Create_Incidents.jmx";
                String logPath = projectDir + File.separator + "results.jtl";
                
                // Safety Check: Verify JMeter path exists before running
                File jmeterExec = new File(jmeterPath);
                if (!jmeterExec.exists()) {
                    return "Error: JMeter not found at " + jmeterPath + ". Check application.properties.";
                }
                
                int threads = Math.min(totalIncidents, 50);
                
                // Find the largest divisor of totalIncidents that's <= 50
                // This ensures threads * loops = totalIncidents exactly
                while (threads > 1 && totalIncidents % threads != 0) {
                    threads--;
                }
                
                int loops = totalIncidents / threads;

                ProcessBuilder processBuilder = new ProcessBuilder();
                processBuilder.command(
                    jmeterPath,
                    "-n",
                    "-t", scriptPath,
                    "-l", logPath,
                    "-Jusers=" + threads,
                    "-Jloops=" + loops
                );

                Process process = processBuilder.start();

                // Optional: Read output to debug
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[JMeter]: " + line);
                }

                int exitCode = process.waitFor();
                return (exitCode == 0) ? "Simulation Completed Successfully" : "Simulation Failed";

            } catch (Exception e) {
                e.printStackTrace();
                return "Error: " + e.getMessage();
            }
        });
    }
}
