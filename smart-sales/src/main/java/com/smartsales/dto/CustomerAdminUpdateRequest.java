package com.smartsales.dto;

public class CustomerAdminUpdateRequest {

    private String fullName;

    private String phone;

    private String status;


    public CustomerAdminUpdateRequest() {
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


    public String getStatus() {

        return status;
    }


    public void setStatus(
            String status
    ) {

        this.status = status;
    }
}