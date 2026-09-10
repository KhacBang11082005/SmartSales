package com.smartsales.dto;

import java.math.BigDecimal;

public class TopProductStatistics {

    private Long productId;

    private String productName;

    private Long totalQuantitySold;

    private BigDecimal totalRevenue;

    public TopProductStatistics() {
    }

    public TopProductStatistics(
            Long productId,
            String productName,
            Long totalQuantitySold,
            BigDecimal totalRevenue) {

        this.productId = productId;
        this.productName = productName;
        this.totalQuantitySold = totalQuantitySold;
        this.totalRevenue = totalRevenue;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getTotalQuantitySold() {
        return totalQuantitySold;
    }

    public void setTotalQuantitySold(Long totalQuantitySold) {
        this.totalQuantitySold = totalQuantitySold;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}