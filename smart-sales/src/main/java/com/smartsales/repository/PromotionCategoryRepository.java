package com.smartsales.repository;

import com.smartsales.entity.PromotionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * =========================================================
 * PROMOTION CATEGORY REPOSITORY
 * =========================================================
 *
 * Quản lý các danh mục được áp dụng bởi chương trình
 * khuyến mại.
 *
 * Ví dụ:
 *
 * Promotion SMART9
 *      ├── Điện thoại
 *      └── Laptop
 *
 * =========================================================
 */
@Repository
public interface PromotionCategoryRepository
        extends JpaRepository<PromotionCategory, Long> {

    /**
     * Lấy toàn bộ danh mục mà promotion đang áp dụng.
     */
    List<PromotionCategory> findByPromotionId(Long promotionId);

    /**
     * Kiểm tra promotion có áp dụng cho danh mục này không.
     */
    boolean existsByPromotionIdAndCategoryId(
            Long promotionId,
            Long categoryId
    );

    /**
     * Xóa toàn bộ danh mục của một promotion.
     *
     * Sẽ dùng sau này khi Admin sửa phạm vi khuyến mại.
     */
    void deleteByPromotionId(Long promotionId);
}