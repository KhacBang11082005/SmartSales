package com.smartsales.repository;

import com.smartsales.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    // =====================================================
    // TÌM KHUYẾN MẠI THEO MÃ
    // =====================================================
    //
    // Ví dụ:
    // Khách nhập "SMART9"
    // Backend sẽ dùng hàm này để tìm chương trình
    // khuyến mại tương ứng.
    //
    Optional<Promotion> findByCode(String code);


    // =====================================================
    // KIỂM TRA MÃ ĐÃ TỒN TẠI HAY CHƯA
    // =====================================================
    //
    // Dùng khi Admin tạo mã mới.
    //
    // Nếu SMART9 đã tồn tại thì không cho tạo
    // thêm một mã SMART9 khác.
    //
    boolean existsByCode(String code);


    // =====================================================
    // TỰ ĐỘNG NGƯNG HOẠT ĐỘNG KHUYẾN MẠI ĐÃ HẾT HẠN
    // =====================================================
    //
    // Chỉ cập nhật những promotion đang ACTIVE.
    //
    // Nếu:
    //
    // endDate <= thời gian hiện tại
    //
    // thì:
    //
    // ACTIVE -> INACTIVE
    //
    @Modifying
    @Query("""
            UPDATE Promotion p
               SET p.status = 'INACTIVE'
             WHERE p.status = 'ACTIVE'
               AND p.endDate <= :now
            """)
    int deactivateExpiredPromotions(
            @Param("now") LocalDateTime now
    );
}