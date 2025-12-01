package com.example.auth.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "Welcome to Admin Dashboard!";
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
                .filter(user -> com.example.auth.enums.UserRole.ADMINISTRATOR.equals(user.getRoleName()))
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
        if (com.example.auth.enums.UserRole.ADMINISTRATOR.equals(user.getRoleName())) {
            return ResponseEntity.badRequest().body("User is already an ADMINISTRATOR");
        }

        // Check if user has verified email
        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body("User must verify email before promotion");
        }

        // Promote user to ADMINISTRATOR
//        user.setRole(com.example.auth.enums.UserRole.ADMINISTRATOR);
        userRepository.save(user);

        return ResponseEntity.ok("User " + user.getEmail() + " promoted to ADMINISTRATOR successfully!");
    }

    @PostMapping("/demote/{userId}")
    public ResponseEntity<?> demoteToUser(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with ID: " + userId);
        }

        User user = userOptional.get();

        // Prevent demoting super admin
        if ("admin@emergency.gov".equals(user.getEmail())) {
            return ResponseEntity.badRequest().body("Cannot demote system administrator");
        }

        // Check if user is already dispatcher
        if (com.example.auth.enums.UserRole.DISPATCHER.equals(user.getRoleName())) {
            return ResponseEntity.badRequest().body("User is already a DISPATCHER");
        }

        // Demote user to DISPATCHER
//        user.setRole(com.example.auth.enums.UserRole.DISPATCHER);
        userRepository.save(user);

        return ResponseEntity.ok("User " + user.getEmail() + " demoted to DISPATCHER successfully!");
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