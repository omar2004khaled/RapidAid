package com.example.auth.service;

import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.config.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Service
public class OAuth2Service {
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public OAuth2Service(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public String processOAuth2User(OAuth2User oauth2User, String provider) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        var existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            // Existing user - generate token and login
            User user = existingUser.get();
            return jwtService.generateToken(user.getEmail(), user.getRoleName().toString());
        } else {
            // New user - return email for profile completion
            return "NEW_USER:" + email;
        }
    }
}