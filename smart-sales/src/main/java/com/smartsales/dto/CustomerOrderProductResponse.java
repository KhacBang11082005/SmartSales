package com.smartsales.dto;

public class CustomerOrderProductResponse {

    private Long orderDetailId;

    private Long productId;

    private String productName;

    private Integer quantity;

    private Boolean reviewed;

    private Integer rating;

    private String comment;

    public CustomerOrderProductResponse() {
    }

    public CustomerOrderProductResponse(
            Long orderDetailId,
            Long productId,
            String productName,
            Integer quantity,
            Boolean reviewed,
            Integer rating,
            String comment
    ) {
        this.orderDetailId = orderDetailId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.reviewed = reviewed;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getOrderDetailId() {
        return orderDetailId;
    }

    public void setOrderDetailId(Long orderDetailId) {
        this.orderDetailId = orderDetailId;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Boolean getReviewed() {
        return reviewed;
    }

    public void setReviewed(Boolean reviewed) {
        this.reviewed = reviewed;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}