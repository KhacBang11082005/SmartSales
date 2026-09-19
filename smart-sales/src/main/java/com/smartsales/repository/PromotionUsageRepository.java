package com.smartsales.repository;

import com.smartsales.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionUsageRepository
        extends JpaRepository<PromotionUsage, Long> {

    // =====================================================
    // KIỂM TRA KHÁCH HÀNG ĐÃ SỬ DỤNG PROMOTION CHƯA
    // =====================================================

    boolean existsByPromotionIdAndCustomerId(
            Long promotionId,
            Long customerId
    );


    // =====================================================
    // KIỂM TRA PROMOTION ĐÃ TỪNG ĐƯỢC SỬ DỤNG CHƯA
    // =====================================================
    //
    // Dùng khi Admin muốn xóa promotion.
    //
    // Nếu đã có lịch sử sử dụng thì không được xóa.
    //
    // =====================================================

    boolean existsByPromotionId(
            Long promotionId
    );
}