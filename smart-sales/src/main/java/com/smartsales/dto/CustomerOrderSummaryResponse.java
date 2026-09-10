package com.smartsales.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerOrderSummaryResponse {

    private Long id;

    private LocalDateTime orderDate;

    private Integer productQuantity;

    private BigDecimal totalAmount;

    private String status;


    public CustomerOrderSummaryResponse() {
    }


    public CustomerOrderSummaryResponse(
            Long id,
            LocalDateTime orderDate,
            Integer productQuantity,
            BigDecimal totalAmount,
            String status
    ) {

        this.id = id;

        this.orderDate = orderDate;

        this.productQuantity =
                productQuantity;

        this.totalAmount =
                totalAmount;

        this.status =
                status;
    }


    public Long getId() {

        return id;
    }


    public void setId(
            Long id
    ) {

        this.id = id;
    }


    public LocalDateTime getOrderDate() {

        return orderDate;
    }


    public void setOrderDate(
            LocalDateTime orderDate
    ) {

        this.orderDate = orderDate;
    }


    public Integer getProductQuantity() {

        return productQuantity;
    }


    public void setProductQuantity(
            Integer productQuantity
    ) {

        this.productQuantity =
                productQuantity;
    }


    public BigDecimal getTotalAmount() {

        return totalAmount;
    }


    public void setTotalAmount(
            BigDecimal totalAmount
    ) {

        this.totalAmount =
                totalAmount;
    }


    public String getStatus() {

        return status;
    }


    public void setStatus(
            String status
    ) {

        this.status = status;
    }
}