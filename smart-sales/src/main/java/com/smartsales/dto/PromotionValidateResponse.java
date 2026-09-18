 package com.smartsales.dto;

import java.math.BigDecimal;

public class PromotionValidateResponse {

    // =====================================================
    // TRẠNG THÁI
    // =====================================================

    private boolean valid;


    // =====================================================
    // THÔNG BÁO
    // =====================================================

    private String message;


    // =====================================================
    // THÔNG TIN KHUYẾN MẠI
    // =====================================================

    private Long promotionId;

    private String code;

    private String name;

    private String discountType;

    private BigDecimal discountValue;


    // =====================================================
    // TIỀN
    // =====================================================

    // Số tiền đơn hàng trước giảm
    private BigDecimal orderAmount;

    // Số tiền được giảm
    private BigDecimal discountAmount;

    // Số tiền sau giảm
    private BigDecimal finalAmount;

    private Long customerId;
    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionValidateResponse() {
    }


    // =====================================================
    // GETTER / SETTER
    // =====================================================

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public Long getPromotionId() {
        return promotionId;
    }

    public void setPromotionId(Long promotionId) {
        this.promotionId = promotionId;
    }


    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }


    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }


    public BigDecimal getOrderAmount() {
        return orderAmount;
    }

    public void setOrderAmount(BigDecimal orderAmount) {
        this.orderAmount = orderAmount;
    }


    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }


    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}

