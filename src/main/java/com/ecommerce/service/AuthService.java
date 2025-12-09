package com.ecommerce.service;

import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.LoginRequest;
import com.ecommerce.dto.RegisterRequest;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    /**
     * Hash password using SHA-256
     * In production, use BCrypt or Argon2
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    /**
     * Check if email is already registered
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(hashPassword(request.getPassword())); // Hash password
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());

        // Set seller-specific fields if role is SELLER
        if (request.getRole() == User.UserRole.SELLER) {
            user.setBusinessName(request.getBusinessName());
            user.setBusinessDescription(request.getBusinessDescription());
        }

        user = userRepository.save(user);

        // Generate simple token (in production, use JWT)
        String token = UUID.randomUUID().toString();

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                token,
                "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();

        // Verify hashed password
        String hashedPassword = hashPassword(request.getPassword());
        if (!user.getPassword().equals(hashedPassword)) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.getActive()) {
            throw new RuntimeException("Account is inactive");
        }

        // Generate simple token (in production, use JWT)
        String token = UUID.randomUUID().toString();

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                token,
                "Login successful");
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(java.util.Objects.requireNonNull(id, "User ID cannot be null"));
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
