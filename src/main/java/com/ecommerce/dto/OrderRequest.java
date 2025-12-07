package com.ecommerce.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String customerName;
    private String customerEmail;
    private String shippingAddress;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
