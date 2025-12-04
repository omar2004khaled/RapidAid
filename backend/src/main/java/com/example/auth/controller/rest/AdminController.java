package com.example.auth.controller.rest;

import com.example.auth.dto.CreateAdminRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.entity.Incident;
import com.example.auth.entity.User;
import com.example.auth.enums.UserRole;
import com.example.auth.mapper.IncidentMapper;
import com.example.auth.repository.IncidentRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IncidentRepository incidentRepository;
    
    @Autowired
    private IncidentMapper incidentMapper;

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

    // Get user by ID
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with ID: " + userId);
        }

        return ResponseEntity.ok(userOptional.get());
    }
}