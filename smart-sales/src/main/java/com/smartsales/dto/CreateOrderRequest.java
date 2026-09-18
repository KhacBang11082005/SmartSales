package com.smartsales.dto;

import java.util.List;

public class CreateOrderRequest {

    private List<OrderItemRequest> items;

    private String shippingName;

    private String shippingPhone;

    private String shippingAddress;

    private String shippingNote;

// =====================================================
// MÃ KHUYẾN MẠI
// =====================================================
    private String promotionCode;
    public CreateOrderRequest() {
    }


    // =====================================================
    // ITEMS
    // =====================================================

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }


    // =====================================================
    // SHIPPING
    // =====================================================

    public String getShippingName() {
        return shippingName;
    }

    public void setShippingName(String shippingName) {
        this.shippingName = shippingName;
    }


    public String getShippingPhone() {
        return shippingPhone;
    }

    public void setShippingPhone(String shippingPhone) {
        this.shippingPhone = shippingPhone;
    }


    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }


    public String getShippingNote() {
        return shippingNote;
    }

    public void setShippingNote(String shippingNote) {
        this.shippingNote = shippingNote;
    }


    // =====================================================
    // ORDER ITEM
    // =====================================================

    public static class OrderItemRequest {

        private Long productId;

        private Integer quantity;


        public OrderItemRequest() {
        }


        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }


        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    // =====================================================
// GETTER / SETTER - PROMOTION CODE
// =====================================================

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }
}