package com.smartsales.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CustomerAdminResponse {

    private Long id;

    private Long userId;

    private String username;

    private String email;

    private String fullName;

    private String phone;

    private String role;

    private String status;

    private LocalDateTime createdAt;

    private List<CustomerOrderSummaryResponse> orders;


    public CustomerAdminResponse() {
    }


    public CustomerAdminResponse(
            Long id,
            Long userId,
            String username,
            String email,
            String fullName,
            String phone,
            String role,
            String status,
            LocalDateTime createdAt
    ) {

        this.id = id;

        this.userId = userId;

        this.username = username;

        this.email = email;

        this.fullName = fullName;

        this.phone = phone;

        this.role = role;

        this.status = status;

        this.createdAt = createdAt;
    }


    public Long getId() {

        return id;
    }


    public void setId(
            Long id
    ) {

        this.id = id;
    }


    public Long getUserId() {

        return userId;
    }


    public void setUserId(
            Long userId
    ) {

        this.userId = userId;
    }


    public String getUsername() {

        return username;
    }


    public void setUsername(
            String username
    ) {

        this.username = username;
    }


    public String getEmail() {

        return email;
    }


    public void setEmail(
            String email
    ) {

        this.email = email;
    }


    public String getFullName() {

        return fullName;
    }


    public void setFullName(
            String fullName
    ) {

        this.fullName = fullName;
    }


    public String getPhone() {

        return phone;
    }


    public void setPhone(
            String phone
    ) {

        this.phone = phone;
    }


    public String getRole() {

        return role;
    }


    public void setRole(
            String role
    ) {

        this.role = role;
    }


    public String getStatus() {

        return status;
    }


    public void setStatus(
            String status
    ) {

        this.status = status;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt = createdAt;
    }


    public List<CustomerOrderSummaryResponse> getOrders() {

        return orders;
    }


    public void setOrders(
            List<CustomerOrderSummaryResponse> orders
    ) {

        this.orders = orders;
    }
}