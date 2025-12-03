package com.example.auth.controller.rest;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.PasswordResetRequest;
import com.example.auth.dto.ResetPasswordRequest;
import com.example.auth.service.AuthService;
import com.example.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok().body("Registration successful. Check console for verification email.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            String role = authService.getUserRole(request.getEmail());

            AuthResponse response = new AuthResponse(
                    token,
                    role,
                    request.getEmail());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            passwordResetService.createPasswordResetToken(request.getEmail());
            return ResponseEntity.ok("If your email exists, a reset link has been sent.");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Server error. Try again.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successful.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Server error.");
        }
    }

    @PostMapping("/complete-oauth-profile")
    public ResponseEntity<?> completeOAuthProfile(@Valid @RequestBody com.example.auth.dto.CompleteProfileRequest request, @RequestParam String email) {
        try {
            String token = authService.completeOAuthProfile(email, request);
            AuthResponse response = new AuthResponse(token, request.getRole().toString(), email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Server error.");
        }
    }


}