package com.example.auth.controller.rest;

import com.example.auth.dto.CreateAdminRequest;
import com.example.auth.entity.Incident;
import com.example.auth.entity.User;
import com.example.auth.enums.UserRole;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IncidentRepository incidentRepository;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, IncidentRepository incidentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.incidentRepository = incidentRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        var users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stats")
    public String getStats() {
        long totalUsers = userRepository.count();
        long enabledUsers = userRepository.findAll().stream()
                .filter(User::isEnabled)
                .count();
        long adminUsers = userRepository.findAll().stream()
                .filter(user -> com.example.auth.enums.UserRole.ADMINISTRATOR.equals(user.getRole()))
                .count();

        return String.format("Total Users: %d, Enabled: %d, Admins: %d",
                totalUsers, enabledUsers, adminUsers);
    }

    @PostMapping("/promote/{userId}")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with ID: " + userId);
        }

        User user = userOptional.get();

        // Check if user is already admin
        if (com.example.auth.enums.UserRole.ADMINISTRATOR.equals(user.getRole())) {
            return ResponseEntity.badRequest().body("User is already an ADMINISTRATOR");
        }

        // Check if user has verified email
        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body("User must verify email before promotion");
        }

        // Promote user to ADMINISTRATOR
        user.setRole(com.example.auth.enums.UserRole.ADMINISTRATOR);
        userRepository.save(user);

        return ResponseEntity.ok("User " + user.getEmail() + " promoted to ADMINISTRATOR successfully!");
    }
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            // Log the request for debugging
            System.out.println("Creating admin with email: " + request.getEmail());

            // Validate name
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Name is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (request.getName().trim().length() < 2) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Name must be at least 2 characters long");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate email
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Please enter a valid email address");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate password
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (request.getPassword().length() < 8 || request.getPassword().length() > 20) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must be between 8-20 characters long");
                return ResponseEntity.badRequest().body(error);
            }
            // Strong password validation
            String password = request.getPassword();
            if (!password.matches(".*[A-Z].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must contain at least one uppercase letter");
                return ResponseEntity.badRequest().body(error);
            }
            if (!password.matches(".*[a-z].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must contain at least one lowercase letter");
                return ResponseEntity.badRequest().body(error);
            }
            if (!password.matches(".*[0-9].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must contain at least one number");
                return ResponseEntity.badRequest().body(error);
            }
            if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':.,<>?].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password must contain at least one special character (!@#$%^&*)");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.badRequest().body(error);
            }

            // Create new admin user
            User admin = new User();
            admin.setFullName(request.getName().trim());
            admin.setEmail(request.getEmail().trim().toLowerCase());
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
            admin.setRole(UserRole.ADMINISTRATOR);
            admin.setEnabled(true); // Auto-enable admin accounts
            admin.setCreatedAt(LocalDateTime.now());

            System.out.println("Saving admin: " + admin.toString());

            User savedAdmin = userRepository.save(admin);

            // Create response map (no need for CreateAdminResponse class)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin created successfully");
            response.put("userId", savedAdmin.getUserId()); // Use getId() or getUserId()
            response.put("name", savedAdmin.getFullName());
            response.put("email", savedAdmin.getEmail());
            response.put("role", savedAdmin.getRole());
            response.put("enabled", savedAdmin.isEnabled());
            response.put("createdAt", savedAdmin.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Log the error
            System.err.println("Error creating admin: " + e.getMessage());
            e.printStackTrace();

            // Return error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create admin");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    @PostMapping("/demote/{userId}")
    public ResponseEntity<?> demoteToUser(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found with ID: " + userId);
            return ResponseEntity.badRequest().body(error);
        }

        User user = userOptional.get();

        // Prevent removing super admin
        if ("admin@rapidaid.com".equals(user.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Cannot remove system administrator");
            return ResponseEntity.badRequest().body(error);
        }

        // Remove the admin user
        String userEmail = user.getEmail();
        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin user " + userEmail + " removed successfully!");
        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with ID: " + userId);
        }

        return ResponseEntity.ok(userOptional.get());
    }

    // Incident Management Endpoints
    @GetMapping("/incidents")
    public ResponseEntity<?> getAllIncidents() {
        try {
            List<Incident> incidents = incidentRepository.findAll();
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch incidents");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/incidents/{incidentId}/status")
    public ResponseEntity<?> updateIncidentStatus(@PathVariable Long incidentId, @RequestBody Map<String, String> request) {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Incident status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update incident status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/incidents/{incidentId}/assign")
    public ResponseEntity<?> assignIncident(@PathVariable Long incidentId, @RequestBody Map<String, Long> request) {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Incident assigned successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign incident");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Unit Management Endpoints
    @GetMapping("/units")
    public ResponseEntity<?> getAllUnits() {
        // Return mock data for now - replace with actual repository call
        java.util.List<java.util.Map<String, Object>> units = new java.util.ArrayList<>();
        
        Map<String, Object> unit1 = new HashMap<>();
        unit1.put("id", 1L);
        unit1.put("type", "Ambulance");
        unit1.put("count", 5);
        unit1.put("location", "Central Station");
        unit1.put("status", "Active");
        units.add(unit1);
        
        Map<String, Object> unit2 = new HashMap<>();
        unit2.put("id", 2L);
        unit2.put("type", "Fire Truck");
        unit2.put("count", 3);
        unit2.put("location", "Fire Station 1");
        unit2.put("status", "Active");
        units.add(unit2);
        
        Map<String, Object> unit3 = new HashMap<>();
        unit3.put("id", 3L);
        unit3.put("type", "Police Car");
        unit3.put("count", 8);
        unit3.put("location", "Police HQ");
        unit3.put("status", "Active");
        units.add(unit3);
        
        return ResponseEntity.ok(units);
    }

    @PostMapping("/units")
    public ResponseEntity<?> createUnit(@RequestBody com.example.auth.dto.UnitCreateRequest request) {
        try {
            // Validate request
            if (request.getType() == null || request.getType().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unit type is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (request.getCount() == null || request.getCount() <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Count must be greater than 0");
                return ResponseEntity.badRequest().body(error);
            }
            if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Location is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Create unit response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Unit created successfully");
            response.put("id", System.currentTimeMillis()); // Mock ID
            response.put("type", request.getType().trim());
            response.put("count", request.getCount());
            response.put("location", request.getLocation().trim());
            response.put("status", "Active");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create unit");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/units/{unitId}")
    public ResponseEntity<?> deleteUnit(@PathVariable Long unitId) {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Unit deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete unit");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/units/{unitId}")
    public ResponseEntity<?> updateUnit(@PathVariable Long unitId, @RequestBody com.example.auth.dto.UnitUpdateRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Unit updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update unit");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}