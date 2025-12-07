package com.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email address format")
    private String email;
}
