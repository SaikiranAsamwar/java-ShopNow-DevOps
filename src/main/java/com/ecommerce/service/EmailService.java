package com.ecommerce.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    // OTP validity duration in minutes
    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and store OTP for email verification
     * 
     * @param email User's email address
     * @return Generated OTP
     */
    public String generateOtp(String email) {
        // Generate 6-digit OTP
        String otp = "%06d".formatted(random.nextInt(999999));

        // Store OTP with expiration time
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        otpStore.put(email, otpData);

        // In production, send OTP via email service (SendGrid, AWS SES, etc.)
        System.out.println("==============================================");
        System.out.println("OTP Verification Code for: " + email);
        System.out.println("Your verification code is: " + otp);
        System.out.println("Valid for " + OTP_VALIDITY_MINUTES + " minutes");
        System.out.println("==============================================");

        return otp;
    }

    /**
     * Validate OTP for email verification
     * 
     * @param email User's email address
     * @param otp   OTP to validate
     * @return true if OTP is valid, false otherwise
     */
    public boolean validateOtp(String email, String otp) {
        OtpData otpData = otpStore.get(email);

        if (otpData == null) {
            return false;
        }

        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpData.getExpirationTime())) {
            otpStore.remove(email);
            return false;
        }

        // Validate OTP
        if (otpData.getOtp().equals(otp)) {
            otpStore.remove(email); // Remove OTP after successful validation
            return true;
        }

        return false;
    }

    /**
     * Resend OTP to user's email
     * 
     * @param email User's email address
     * @return New OTP
     */
    public String resendOtp(String email) {
        return generateOtp(email);
    }

    /**
     * Internal class to store OTP data
     */
    private static class OtpData {
        private final String otp;
        private final LocalDateTime expirationTime;

        public OtpData(String otp, LocalDateTime expirationTime) {
            this.otp = otp;
            this.expirationTime = expirationTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpirationTime() {
            return expirationTime;
        }
    }
}
