package com.example.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.example.auth.repository.UserRepository;
import com.example.auth.entity.User;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }


    @Bean
    CommandLineRunner createSuperAdmin(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            // Check if super admin already exists
            if (userRepository.findByEmail("admin@emergency.gov").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setFullName("System Administrator");
                admin.setEmail("admin@emergency.gov");
                admin.setPassword(encoder.encode("EmergencyAdmin123!"));
                admin.setPhone("+20-10-0000-0000");
                admin.setRole(com.example.auth.enums.UserRole.ADMINISTRATOR);
                admin.setStatus(com.example.auth.enums.UserStatus.ACTIVE);
                admin.setEnabled(true);

                userRepository.save(admin);
                System.out.println("\n=== EMERGENCY SYSTEM ADMIN CREATED ===");
                System.out.println("Email: admin@emergency.gov");
                System.out.println("Password: EmergencyAdmin123!");
                System.out.println("Role: ADMINISTRATOR");
                System.out.println("=====================================\n");
            } else {
                System.out.println("Emergency system admin already exists: admin@emergency.gov");
            }
        };
    }
}