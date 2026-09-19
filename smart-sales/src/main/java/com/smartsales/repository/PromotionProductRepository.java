package com.smartsales.repository;

import com.smartsales.entity.PromotionProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * =========================================================
 * PROMOTION PRODUCT REPOSITORY
 * =========================================================
 *
 * Quản lý các sản phẩm cụ thể được áp dụng khuyến mại.
 *
 * Ví dụ:
 *
 * Promotion SPECIAL10
 *      ├── iPhone 16
 *      ├── Samsung S25
 *      └── MacBook Air
 *
 * =========================================================
 */
@Repository
public interface PromotionProductRepository
        extends JpaRepository<PromotionProduct, Long> {

    /**
     * Lấy toàn bộ sản phẩm mà promotion đang áp dụng.
     */
    List<PromotionProduct> findByPromotionId(Long promotionId);

    /**
     * Kiểm tra promotion có áp dụng cho sản phẩm này không.
     */
    boolean existsByPromotionIdAndProductId(
            Long promotionId,
            Long productId
    );

    /**
     * Xóa toàn bộ sản phẩm của một promotion.
     *
     * Sẽ dùng sau này khi Admin sửa phạm vi khuyến mại.
     */
    void deleteByPromotionId(Long promotionId);
}