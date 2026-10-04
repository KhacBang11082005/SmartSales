package com.smartsales.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CustomerOrderSummaryResponse {

    private Long id;

    private LocalDateTime orderDate;

    private Integer productQuantity;

    private BigDecimal totalAmount;

    private String status;

    /*
     * Danh sách các sản phẩm có trong đơn hàng.
     *
     * Giữ nguyên các field cũ ở phía trên để không
     * làm ảnh hưởng đến chức năng hiện tại.
     */
    private List<CustomerOrderProductResponse> products =
            new ArrayList<>();


    // =========================================================
    // CONSTRUCTOR MẶC ĐỊNH
    // =========================================================

    public CustomerOrderSummaryResponse() {
    }


    // =========================================================
    // CONSTRUCTOR CŨ
    //
    // Giữ lại constructor này để tránh ảnh hưởng đến
    // những đoạn code hiện tại đang sử dụng.
    // =========================================================

    public CustomerOrderSummaryResponse(
            Long id,
            LocalDateTime orderDate,
            Integer productQuantity,
            BigDecimal totalAmount,
            String status
    ) {
        this.id = id;
        this.orderDate = orderDate;
        this.productQuantity = productQuantity;
        this.totalAmount = totalAmount;
        this.status = status;
    }


    // =========================================================
    // CONSTRUCTOR MỚI
    //
    // Dùng khi backend trả thêm danh sách sản phẩm.
    // =========================================================

    public CustomerOrderSummaryResponse(
            Long id,
            LocalDateTime orderDate,
            Integer productQuantity,
            BigDecimal totalAmount,
            String status,
            List<CustomerOrderProductResponse> products
    ) {
        this.id = id;
        this.orderDate = orderDate;
        this.productQuantity = productQuantity;
        this.totalAmount = totalAmount;
        this.status = status;

        this.products =
                products != null
                        ? products
                        : new ArrayList<>();
    }


    // =========================================================
    // GETTER / SETTER
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }


    public Integer getProductQuantity() {
        return productQuantity;
    }

    public void setProductQuantity(Integer productQuantity) {
        this.productQuantity = productQuantity;
    }


    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    // =========================================================
    // PRODUCTS
    // =========================================================

    public List<CustomerOrderProductResponse> getProducts() {
        return products;
    }

    public void setProducts(
            List<CustomerOrderProductResponse> products
    ) {
        this.products =
                products != null
                        ? products
                        : new ArrayList<>();
    }
}