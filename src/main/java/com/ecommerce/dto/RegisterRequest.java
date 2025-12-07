package com.ecommerce.dto;

import com.ecommerce.model.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String address;
    private User.UserRole role;

    // Seller-specific fields
    private String businessName;
    private String businessDescription;
}
