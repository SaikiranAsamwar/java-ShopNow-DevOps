package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.model.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return authService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate-otp")
    public ResponseEntity<?> generateOtp(@RequestBody OtpRequest request) {
        try {
            // Check if email already exists
            if (authService.emailExists(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email address is already registered");
            }

            emailService.generateOtp(request.getEmail());
            OtpResponse response = new OtpResponse(
                    "Verification code sent successfully to your email",
                    request.getEmail(),
                    10);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate verification code");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        try {
            boolean isValid = emailService.validateOtp(request.getEmail(), request.getOtp());
            if (isValid) {
                return ResponseEntity.ok("Email verified successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired verification code");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Verification failed");
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody OtpRequest request) {
        try {
            emailService.resendOtp(request.getEmail());
            OtpResponse response = new OtpResponse(
                    "Verification code resent successfully",
                    request.getEmail(),
                    10);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to resend verification code");
        }
    }
}
