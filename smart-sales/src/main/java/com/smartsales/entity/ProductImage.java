package com.smartsales.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "product_images")
public class ProductImage {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // SẢN PHẨM
    //
    // Nhiều ảnh thuộc về một sản phẩm.
    //
    // JsonIgnore giúp tránh vòng lặp JSON:
    //
    // Product
    //    ↓
    // ProductImage
    //    ↓
    // Product
    //
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    @JsonIgnore
    private Product product;


    // =========================================================
    // URL ẢNH
    // =========================================================

    @Column(
            name = "image_url",
            nullable = false,
            length = 500
    )
    private String imageUrl;


    // =========================================================
    // ẢNH CHÍNH
    // =========================================================

    @Column(
            name = "is_primary",
            nullable = false
    )
    private Boolean primary = false;


    // =========================================================
    // THỨ TỰ HIỂN THỊ
    // =========================================================

    @Column(
            name = "display_order",
            nullable = false
    )
    private Integer displayOrder = 0;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ProductImage() {
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


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    public Boolean getPrimary() {
        return primary;
    }

    public void setPrimary(Boolean primary) {
        this.primary = primary;
    }


    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}