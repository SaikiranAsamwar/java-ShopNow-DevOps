package com.ecommerce.dto;

import com.ecommerce.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String email;
    private String fullName;
    private User.UserRole role;
    private String token;
    private String message;
}
