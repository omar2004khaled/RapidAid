package com.example.auth.service;

import com.example.auth.config.JwtService;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.entity.User;
import com.example.auth.entity.VerificationToken;
import com.example.auth.enums.UserStatus;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.VerificationTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final VerificationTokenRepository tokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepo,
                       VerificationTokenRepository tokenRepo,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       JwtService jwtService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        // 1. Check if username already exists
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // 2. Check if email already exists
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // 3. Check if passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // 4. Check password complexity
        String password = request.getPassword();
        if (!password.matches("^(?=.*[0-9])(?=.*[A-Z]).{8,20}$")) {
            throw new IllegalArgumentException("Password must contain at least one digit, one uppercase letter, and be 8-20 characters long");
        }

        // 5. Create and save user
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setEnabled(false); // User must verify email first
        user.setCreatedAt(LocalDateTime.now());

        userRepo.save(user);

        // 6. Create verification token
        VerificationToken verificationToken = new VerificationToken(user, LocalDateTime.now().plusDays(1));
        tokenRepo.save(verificationToken);

        // 7. Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());
    }
    public String login(String email, String password) {
        // 1. Find user by email
        var userOptional = userRepo.findByEmail(email.toLowerCase());
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOptional.get();

        // 2. Check if email is verified
        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Please verify your email first");
        }

        // 3. Check if password matches
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        // 4. Generate JWT token
        return jwtService.generateToken(user.getEmail(), user.getRole().toString());
    }

    public String getUserRole(String email) {
        var userOptional = userRepo.findByEmail(email.toLowerCase());
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        return userOptional.get().getRole() != null ? userOptional.get().getRole().toString() : "REPORTER";
    }

    @Transactional
    public String completeOAuthProfile(String email, com.example.auth.dto.CompleteProfileRequest request) {
        // Check if username already exists
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Create new user with OAuth data
        User user = new User();
        user.setEmail(email.toLowerCase());
        user.setUsername(request.getUsername().trim());
        user.setPhone(request.getPhone());
//        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setPassword("OAUTH_USER"); // Placeholder for OAuth users
        
        // Extract name from email as fallback
        String nameFromEmail = email.split("@")[0].replace(".", " ");
        user.setFullName(nameFromEmail);

        userRepo.save(user);

        // Generate JWT token
        return jwtService.generateToken(user.getEmail(), user.getRole().toString());
    }
}