package com.smartsales.entity;

import jakarta.persistence.*;

/**
 * =========================================================
 * PROMOTION PRODUCT
 * =========================================================
 *
 * Bảng trung gian giữa:
 *      promotions
 *          và
 *      products
 *
 * Dùng khi chương trình khuyến mại có:
 *      scopeType = PRODUCT
 *
 * Một promotion có thể áp dụng cho:
 *      - 1 sản phẩm
 *      - nhiều sản phẩm
 *
 * Ví dụ:
 *      SPECIAL10
 *          ├── iPhone 16
 *          ├── Samsung S25
 *          └── MacBook Air
 *
 * =========================================================
 */
@Entity
@Table(
        name = "promotion_products",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_promotion_product",
                        columnNames = {
                                "promotion_id",
                                "product_id"
                        }
                )
        }
)
public class PromotionProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CHƯƠNG TRÌNH KHUYẾN MẠI
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "promotion_id",
            nullable = false
    )
    private Promotion promotion;

    // =====================================================
    // SẢN PHẨM ĐƯỢC ÁP DỤNG
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private Product product;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionProduct() {
    }

    // =====================================================
    // GETTER / SETTER
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}