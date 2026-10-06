package com.smartsales.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Khách hàng thực hiện đánh giá
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /**
     * Sản phẩm được đánh giá
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Chi tiết đơn hàng mà review này thuộc về.
     *
     * order_detail_id đang cho phép NULL trong database
     * để giữ an toàn cho các review cũ.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_detail_id")
    private OrderDetail orderDetail;

    /**
     * Số sao đánh giá: 1 - 5
     */
    @Column(nullable = false)
    private Integer rating;

    /**
     * Nội dung đánh giá
     */
    @Column(columnDefinition = "TEXT")
    private String comment;

    /**
     * Thời gian tạo review
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật review
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Hình ảnh / video của review
     */
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("displayOrder ASC")
    private List<ReviewMedia> media = new ArrayList<>();


    // =========================================================
    // GETTER / SETTER
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public void setOrderDetail(OrderDetail orderDetail) {
        this.orderDetail = orderDetail;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ReviewMedia> getMedia() {
        return media;
    }

    public void setMedia(List<ReviewMedia> media) {
        this.media = media;
    }
}