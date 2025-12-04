package com.example.auth.controller.rest;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.PasswordResetRequest;
import com.example.auth.dto.ResetPasswordRequest;
import com.example.auth.service.AuthService;
import com.example.auth.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account. The user will receive a verification email and must verify their email before logging in."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Registration successful",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation error or email already exists",
                    content = @Content(mediaType = "application/json")
            )
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Registration successful. Please check your email for verification and wait for admin approval.");
            return ResponseEntity.ok().body(response);
        } catch (IllegalArgumentException ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Operation(
            summary = "User login",
            description = "Authenticates a user and returns a JWT token for subsequent API calls. The user must have verified their email."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - invalid credentials or email not verified",
                    content = @Content(mediaType = "application/json")
            )
    })
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
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @Operation(
            summary = "Request password reset",
            description = "Sends a password reset link to the user's email if the account exists."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Request processed",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Server error",
                    content = @Content(mediaType = "application/json")
            )
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            passwordResetService.createPasswordResetToken(request.getEmail());
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "If your email exists, a reset link has been sent.");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Server error. Try again.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @Operation(
            summary = "Reset password",
            description = "Resets the user's password using the token sent to their email."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Password reset successful",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid or expired token",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Password reset successful.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Server error.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @Operation(
            summary = "Complete OAuth profile",
            description = "Completes user profile information after OAuth authentication (e.g., Google login). Users must provide additional required information."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile completed successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - validation error"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/complete-oauth-profile")
    public ResponseEntity<?> completeOAuthProfile(
            @Valid @RequestBody com.example.auth.dto.CompleteProfileRequest request,
            @Parameter(description = "User's email from OAuth provider", required = true)
            @RequestParam String email) {
        try {
            String token = authService.completeOAuthProfile(email, request);
            AuthResponse response = new AuthResponse(token, request.getRole().toString(), email);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Server error occurred");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


}
