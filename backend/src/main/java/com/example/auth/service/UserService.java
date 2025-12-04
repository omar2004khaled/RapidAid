package com.example.auth.service;

import com.example.auth.entity.User;
import com.example.auth.enums.UserRole;
import com.example.auth.enums.UserStatus;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createAdminUser(String username, String fullName, String email, String password, String phone) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("User with username " + username + " already exists");
        }

        User adminUser = new User();
        adminUser.setUsername(username);
        adminUser.setFullName(fullName);
        adminUser.setEmail(email);
        adminUser.setPassword(passwordEncoder.encode(password));
        adminUser.setPhone(phone);
        adminUser.setRole(UserRole.ADMINISTRATOR);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEnabled(true);

        return userRepository.save(adminUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public List<User> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING);
    }

    @Transactional
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        user.setEnabled(true); // Enable the user account
        userRepository.save(user);
    }

    @Transactional
    public void rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);
    }
}
