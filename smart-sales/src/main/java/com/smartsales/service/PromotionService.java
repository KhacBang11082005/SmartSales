package com.smartsales.service;

import com.smartsales.entity.Promotion;
import com.smartsales.repository.PromotionRepository;
import com.smartsales.repository.PromotionUsageRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    // Repository dùng để kiểm tra:
    // Khách hàng đã sử dụng mã khuyến mại này chưa
    private final PromotionUsageRepository promotionUsageRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionService(
            PromotionRepository promotionRepository,
            PromotionUsageRepository promotionUsageRepository
    ) {

        this.promotionRepository = promotionRepository;

        this.promotionUsageRepository =
                promotionUsageRepository;
    }


    // =====================================================
    // TÌM KHUYẾN MẠI THEO MÃ
    // =====================================================

    public Promotion findByCode(String code) {

        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        String normalizedCode =
                code.trim().toUpperCase();

        return promotionRepository
                .findByCode(normalizedCode)
                .orElse(null);
    }


    // =====================================================
    // KIỂM TRA MÃ KHUYẾN MẠI
    // =====================================================
    //
    // Bây giờ có thêm customerId.
    //
    // Điều này cho phép kiểm tra:
    //
    // Khách hàng này đã sử dụng mã này chưa?
    //
    // =====================================================

    public Promotion validatePromotion(
            String code,
            BigDecimal orderAmount,
            Long customerId
    ) {

        // -------------------------------------------------
        // 1. Kiểm tra mã
        // -------------------------------------------------

        if (code == null || code.trim().isEmpty()) {

            throw new RuntimeException(
                    "Vui lòng nhập mã khuyến mại"
            );
        }


        // -------------------------------------------------
        // 2. Kiểm tra customer
        // -------------------------------------------------

        if (customerId == null) {

            throw new RuntimeException(
                    "Không xác định được khách hàng"
            );
        }


        // -------------------------------------------------
        // 3. Chuẩn hóa mã
        // -------------------------------------------------

        String normalizedCode =
                code.trim().toUpperCase();


        // -------------------------------------------------
        // 4. Tìm mã
        // -------------------------------------------------

        Promotion promotion =
                promotionRepository
                        .findByCode(normalizedCode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mã khuyến mại không tồn tại"
                                )
                        );


        // -------------------------------------------------
        // 5. Kiểm tra trạng thái
        // -------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                promotion.getStatus()
        )) {

            throw new RuntimeException(
                    "Mã khuyến mại hiện không hoạt động"
            );
        }


        // -------------------------------------------------
        // 6. Kiểm tra thời gian
        // -------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();

        if (now.isBefore(
                promotion.getStartDate()
        )) {

            throw new RuntimeException(
                    "Mã khuyến mại chưa bắt đầu"
            );
        }

        if (now.isAfter(
                promotion.getEndDate()
        )) {

            throw new RuntimeException(
                    "Mã khuyến mại đã hết hạn"
            );
        }


        // -------------------------------------------------
        // 7. Kiểm tra số lượt sử dụng
        // -------------------------------------------------

        if (promotion.getUsedCount()
                >= promotion.getUsageLimit()) {

            throw new RuntimeException(
                    "Mã khuyến mại đã hết lượt sử dụng"
            );
        }


        // -------------------------------------------------
        // 8. Kiểm tra giá trị đơn hàng
        // -------------------------------------------------

        if (orderAmount == null) {

            throw new RuntimeException(
                    "Không xác định được giá trị đơn hàng"
            );
        }


        if (orderAmount.compareTo(
                promotion.getMinOrderAmount()
        ) < 0) {

            throw new RuntimeException(
                    "Đơn hàng chưa đạt giá trị tối thiểu "
                            + formatMoney(
                            promotion.getMinOrderAmount()
                    )
            );
        }


        // -------------------------------------------------
        // 9. KIỂM TRA KHÁCH ĐÃ DÙNG MÃ CHƯA
        // -------------------------------------------------

        boolean alreadyUsed =
                promotionUsageRepository
                        .existsByPromotionIdAndCustomerId(
                                promotion.getId(),
                                customerId
                        );


        if (alreadyUsed) {

            throw new RuntimeException(
                    "Bạn đã sử dụng mã khuyến mại này rồi"
            );
        }


        // -------------------------------------------------
        // 10. Tất cả đều hợp lệ
        // -------------------------------------------------

        return promotion;
    }


    // =====================================================
    // TÍNH TIỀN GIẢM
    // =====================================================

    public BigDecimal calculateDiscount(
            Promotion promotion,
            BigDecimal orderAmount
    ) {

        if (promotion == null) {
            return BigDecimal.ZERO;
        }

        if (orderAmount == null
                || orderAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            return BigDecimal.ZERO;
        }


        BigDecimal discount;


        // -------------------------------------------------
        // GIẢM THEO %
        // -------------------------------------------------

        if ("PERCENT".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            discount = orderAmount
                    .multiply(
                            promotion.getDiscountValue()
                    )
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );
        }


        // -------------------------------------------------
        // GIẢM SỐ TIỀN CỐ ĐỊNH
        // -------------------------------------------------

        else if ("FIXED".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            discount =
                    promotion.getDiscountValue();
        }


        // -------------------------------------------------
        // LOẠI KHÔNG HỢP LỆ
        // -------------------------------------------------

        else {

            throw new RuntimeException(
                    "Loại khuyến mại không hợp lệ"
            );
        }


        // -------------------------------------------------
        // GIỚI HẠN MỨC GIẢM
        // -------------------------------------------------

        if (promotion.getMaxDiscount() != null
                && discount.compareTo(
                promotion.getMaxDiscount()
        ) > 0) {

            discount =
                    promotion.getMaxDiscount();
        }


        // -------------------------------------------------
        // KHÔNG CHO GIẢM QUÁ GIÁ TRỊ ĐƠN
        // -------------------------------------------------

        if (discount.compareTo(
                orderAmount
        ) > 0) {

            discount = orderAmount;
        }


        return discount.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }


    // =====================================================
    // TÍNH TỔNG TIỀN SAU GIẢM
    // =====================================================

    public BigDecimal calculateFinalAmount(
            BigDecimal orderAmount,
            BigDecimal discount
    ) {

        if (orderAmount == null) {
            return BigDecimal.ZERO;
        }

        if (discount == null) {
            discount = BigDecimal.ZERO;
        }


        BigDecimal finalAmount =
                orderAmount.subtract(discount);


        if (finalAmount.compareTo(
                BigDecimal.ZERO
        ) < 0) {

            finalAmount =
                    BigDecimal.ZERO;
        }


        return finalAmount.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }


    // =====================================================
    // KIỂM TRA MÃ TỒN TẠI
    // =====================================================

    public boolean existsByCode(String code) {

        if (code == null
                || code.trim().isEmpty()) {

            return false;
        }

        return promotionRepository.existsByCode(
                code.trim().toUpperCase()
        );
    }


    // =====================================================
    // FORMAT TIỀN
    // =====================================================

    private String formatMoney(
            BigDecimal amount
    ) {

        if (amount == null) {
            return "0đ";
        }

        return amount
                .setScale(
                        0,
                        RoundingMode.HALF_UP
                )
                .toPlainString()
                + "đ";
    }
}

