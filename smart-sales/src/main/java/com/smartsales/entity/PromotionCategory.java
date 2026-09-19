package com.smartsales.entity;

import jakarta.persistence.*;

/**
 * =========================================================
 * PROMOTION CATEGORY
 * =========================================================
 *
 * Bảng trung gian giữa:
 *      promotions
 *          và
 *      categories
 *
 * Dùng khi chương trình khuyến mại có:
 *      scopeType = CATEGORY
 *
 * Một promotion có thể áp dụng cho:
 *      - 1 danh mục
 *      - nhiều danh mục
 *
 * Ví dụ:
 *      SMART9
 *          ├── Điện thoại
 *          └── Laptop
 *
 * =========================================================
 */
@Entity
@Table(
        name = "promotion_categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_promotion_category",
                        columnNames = {
                                "promotion_id",
                                "category_id"
                        }
                )
        }
)
public class PromotionCategory {

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
    // DANH MỤC ĐƯỢC ÁP DỤNG
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "category_id",
            nullable = false
    )
    private Category category;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionCategory() {
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}