package com.example.auth.controller.rest;

import com.example.auth.entity.User;
import com.example.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Management", description = "User management and admin user creation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserService userService;

    @Operation(
            summary = "Get all users",
            description = "Retrieves a list of all registered users in the system."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved users list",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = User.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid")
    })
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(
            summary = "Create admin user",
            description = "Creates a new administrator user with elevated privileges."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Admin user created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = User.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/create-admin")
    public ResponseEntity<User> createAdminUser(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Admin user details",
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(value = """
                                    {
                                        "username": "admin_user",
                                        "fullName": "Admin User",
                                        "email": "admin@example.com",
                                        "password": "AdminPass123!",
                                        "phone": "+1234567890"
                                    }
                                    """)
                    )
            )
            @RequestBody Map<String, String> request) {
        User adminUser = userService.createAdminUser(
                request.get("username"),
                request.get("fullName"),
                request.get("email"),
                request.get("password"),
                request.get("phone")
        );
        return ResponseEntity.ok(adminUser);
    }

    @Operation(
            summary = "Delete user",
            description = "Deletes a user from the system by their ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "User deleted successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"User deleted successfully\"")
                    )
            ),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @Parameter(description = "User ID to delete", required = true, example = "1")
            @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
