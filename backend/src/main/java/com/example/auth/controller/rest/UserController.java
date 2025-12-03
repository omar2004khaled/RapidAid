package com.example.auth.controller.rest;

import com.example.auth.entity.User;
import com.example.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create-admin")
    public ResponseEntity<User> createAdminUser(@RequestBody Map<String, String> request) {
        User adminUser = userService.createAdminUser(
                request.get("username"),
                request.get("fullName"),
                request.get("email"),
                request.get("password"),
                request.get("phone")
        );
        return ResponseEntity.ok(adminUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
