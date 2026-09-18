package com.smartsales.repository;

import com.smartsales.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionUsageRepository
        extends JpaRepository<PromotionUsage, Long> {

    // =====================================================
    // KIỂM TRA KHÁCH HÀNG ĐÃ DÙNG MÃ NÀY CHƯA
    // =====================================================
    //
    // Ví dụ:
    //
    // Khách hàng A đã dùng SMART9
    // → trả về true
    //
    // Khách hàng B chưa dùng SMART9
    // → trả về false
    //
    boolean existsByPromotionIdAndCustomerId(
            Long promotionId,
            Long customerId
    );
}

