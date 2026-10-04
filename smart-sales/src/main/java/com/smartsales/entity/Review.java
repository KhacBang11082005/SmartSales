package com.smartsales.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "product_reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_review_customer_product",
                        columnNames = {"customer_id", "product_id"}
                )
        }
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // KHÁCH HÀNG ĐÁNH GIÁ
    // =========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // =========================================================
    // SẢN PHẨM ĐƯỢC ĐÁNH GIÁ
    // =========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // =========================================================
    // SỐ SAO: 1 -> 5
    // =========================================================
    @Column(nullable = false)
    private Integer rating;

    // =========================================================
    // NỘI DUNG ĐÁNH GIÁ
    // =========================================================
    @Column(columnDefinition = "TEXT")
    private String comment;

    // =========================================================
    // THỜI GIAN TẠO
    // =========================================================
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // =========================================================
    // THỜI GIAN CẬP NHẬT
    // =========================================================
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================================================
    // ẢNH / VIDEO CỦA ĐÁNH GIÁ
    // =========================================================
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("displayOrder ASC")
    private List<ReviewMedia> media = new ArrayList<>();


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Review() {
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