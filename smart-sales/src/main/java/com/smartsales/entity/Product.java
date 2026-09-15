package com.smartsales.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    // =========================================================
    // ID SẢN PHẨM
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // DANH MỤC
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;


    // =========================================================
    // TÊN SẢN PHẨM
    // =========================================================

    @Column(nullable = false, length = 150)
    private String name;


    // =========================================================
    // MÔ TẢ
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String description;


    // =========================================================
    // GIÁ
    // =========================================================

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;


    // =========================================================
    // ẢNH ĐẠI DIỆN / ẢNH CHÍNH
    //
    // Vẫn giữ image_url để các trang:
    // - Home
    // - Products
    // - AdminProducts
    //
    // không bị ảnh hưởng.
    // =========================================================

    @Column(name = "image_url", length = 500)
    private String imageUrl;


    // =========================================================
    // SỐ LƯỢNG TỒN KHO
    // =========================================================

    @Column(nullable = false)
    private Integer quantity = 0;


    // =========================================================
    // TRẠNG THÁI
    // =========================================================

    @Enumerated(EnumType.STRING)
    private Status status;


    // =========================================================
    // NGÀY TẠO
    // =========================================================

    @Column(name = "created_at")
    private LocalDateTime createdAt;


    // =========================================================
    // NGÀY CẬP NHẬT
    // =========================================================

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // =========================================================
    // STATUS
    // =========================================================

    public enum Status {
        ACTIVE,
        INACTIVE
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Product() {
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


    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }


    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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
}