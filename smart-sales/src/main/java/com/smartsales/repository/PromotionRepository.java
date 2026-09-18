package com.smartsales.repository;

import com.smartsales.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
}

