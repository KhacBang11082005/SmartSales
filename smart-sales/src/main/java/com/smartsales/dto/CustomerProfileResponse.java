package com.smartsales.dto;

import java.time.LocalDateTime;

public class CustomerProfileResponse {

    private Long userId;

    private Long customerId;

    private String username;

    private String email;

    private String fullName;

    private String phone;

    private String address;

    private String role;

    private String status;

    private LocalDateTime createdAt;


    public CustomerProfileResponse() {
    }


    public CustomerProfileResponse(
            Long userId,
            Long customerId,
            String username,
            String email,
            String fullName,
            String phone,
            String address,
            String role,
            String status,
            LocalDateTime createdAt
    ) {

        this.userId = userId;
        this.customerId = customerId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

