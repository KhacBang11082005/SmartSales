package com.smartsales.dto;

import java.math.BigDecimal;

public class DashboardStatistics {

    private Long totalOrders;

    private Long completedOrders;

    private BigDecimal totalRevenue;

    private Long totalProductsSold;

    private Long pendingOrders;

    private Long confirmedOrders;

    private Long processingOrders;

    private Long cancelledOrders;

    public DashboardStatistics() {
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalProductsSold() {
        return totalProductsSold;
    }

    public void setTotalProductsSold(Long totalProductsSold) {
        this.totalProductsSold = totalProductsSold;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public Long getConfirmedOrders() {
        return confirmedOrders;
    }

    public void setConfirmedOrders(Long confirmedOrders) {
        this.confirmedOrders = confirmedOrders;
    }

    public Long getProcessingOrders() {
        return processingOrders;
    }

    public void setProcessingOrders(Long processingOrders) {
        this.processingOrders = processingOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(Long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
}