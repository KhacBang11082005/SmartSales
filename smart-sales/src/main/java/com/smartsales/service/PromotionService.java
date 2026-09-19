package com.smartsales.service;

import com.smartsales.entity.Category;
import com.smartsales.entity.Product;
import com.smartsales.entity.Promotion;
import com.smartsales.entity.PromotionCategory;
import com.smartsales.entity.PromotionProduct;

import com.smartsales.repository.CategoryRepository;
import com.smartsales.repository.ProductRepository;
import com.smartsales.repository.PromotionCategoryRepository;
import com.smartsales.repository.PromotionProductRepository;
import com.smartsales.repository.PromotionRepository;
import com.smartsales.repository.PromotionUsageRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    // =====================================================
    // PROMOTION USAGE
    // =====================================================
    // Kiểm tra khách hàng đã sử dụng promotion chưa.
    // =====================================================

    private final PromotionUsageRepository promotionUsageRepository;

    // =====================================================
    // PROMOTION CATEGORY
    // =====================================================

    private final PromotionCategoryRepository promotionCategoryRepository;

    // =====================================================
    // PROMOTION PRODUCT
    // =====================================================

    private final PromotionProductRepository promotionProductRepository;

    // =====================================================
    // CATEGORY REPOSITORY
    // =====================================================

    private final CategoryRepository categoryRepository;

    // =====================================================
    // PRODUCT REPOSITORY
    // =====================================================

    private final ProductRepository productRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionService(
            PromotionRepository promotionRepository,
            PromotionUsageRepository promotionUsageRepository,
            PromotionCategoryRepository promotionCategoryRepository,
            PromotionProductRepository promotionProductRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository
    ) {

        this.promotionRepository =
                promotionRepository;

        this.promotionUsageRepository =
                promotionUsageRepository;

        this.promotionCategoryRepository =
                promotionCategoryRepository;

        this.promotionProductRepository =
                promotionProductRepository;

        this.categoryRepository =
                categoryRepository;

        this.productRepository =
                productRepository;
    }


    // =====================================================
    // =====================================================
    // PHẦN 1 - ADMIN CRUD PROMOTION
    // =====================================================
    // =====================================================


    // =====================================================
    // LẤY TẤT CẢ KHUYẾN MẠI
    // =====================================================

    public List<Promotion> getAllPromotions() {

        return promotionRepository.findAll();
    }


    // =====================================================
    // LẤY CHI TIẾT KHUYẾN MẠI
    // =====================================================

    public Promotion getPromotionById(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "ID khuyến mại không được để trống"
            );
        }

        return promotionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy khuyến mại với id: "
                                        + id
                        )
                );
    }


    // =====================================================
    // LẤY DANH MỤC CỦA PROMOTION
    // =====================================================

    public List<Long> getPromotionCategoryIds(
            Long promotionId
    ) {

        return promotionCategoryRepository
                .findByPromotionId(promotionId)
                .stream()
                .map(item ->
                        item.getCategory().getId()
                )
                .collect(Collectors.toList());
    }


    // =====================================================
    // LẤY SẢN PHẨM CỦA PROMOTION
    // =====================================================

    public List<Long> getPromotionProductIds(
            Long promotionId
    ) {

        return promotionProductRepository
                .findByPromotionId(promotionId)
                .stream()
                .map(item ->
                        item.getProduct().getId()
                )
                .collect(Collectors.toList());
    }


    // =====================================================
    // TẠO PROMOTION
    // =====================================================
    //
    // Admin tạo chương trình khuyến mại.
    //
    // scope:
    //
    // ALL
    // CATEGORY
    // PRODUCT
    //
    // categoryIds:
    // danh sách category được chọn.
    //
    // productIds:
    // danh sách product được chọn.
    //
    // =====================================================

    @Transactional
    public Promotion createPromotion(
            Promotion promotion,
            List<Long> categoryIds,
            List<Long> productIds
    ) {

        // -------------------------------------------------
        // VALIDATE THÔNG TIN CHUNG
        // -------------------------------------------------

        validatePromotionData(
                promotion
        );


        // -------------------------------------------------
        // CHUẨN HÓA CODE
        // -------------------------------------------------

        String code =
                promotion.getCode()
                        .trim()
                        .toUpperCase();

        promotion.setCode(code);


        // -------------------------------------------------
        // KIỂM TRA CODE TRÙNG
        // -------------------------------------------------

        if (promotionRepository.existsByCode(code)) {

            throw new RuntimeException(
                    "Mã khuyến mại "
                            + code
                            + " đã tồn tại"
            );
        }


        // -------------------------------------------------
        // KHÔNG CHO FRONTEND TỰ GÁN USED COUNT
        // -------------------------------------------------

        promotion.setUsedCount(0);


        // -------------------------------------------------
        // CHUẨN HÓA SCOPE
        // -------------------------------------------------

        String scopeType =
                normalizeScope(
                        promotion.getScopeType()
                );

        promotion.setScopeType(
                scopeType
        );


        // -------------------------------------------------
        // LƯU PROMOTION
        // -------------------------------------------------

        Promotion savedPromotion =
                promotionRepository.save(
                        promotion
                );


        // -------------------------------------------------
        // LƯU PHẠM VI
        // -------------------------------------------------

        savePromotionScope(
                savedPromotion,
                categoryIds,
                productIds
        );


        return savedPromotion;
    }


    // =====================================================
    // CẬP NHẬT PROMOTION
    // =====================================================

    @Transactional
    public Promotion updatePromotion(
            Long id,
            Promotion requestPromotion,
            List<Long> categoryIds,
            List<Long> productIds
    ) {

        // -------------------------------------------------
        // TÌM PROMOTION HIỆN TẠI
        // -------------------------------------------------

        Promotion existingPromotion =
                getPromotionById(id);


        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validatePromotionData(
                requestPromotion
        );


        // -------------------------------------------------
        // CHUẨN HÓA CODE
        // -------------------------------------------------

        String newCode =
                requestPromotion
                        .getCode()
                        .trim()
                        .toUpperCase();


        // -------------------------------------------------
        // KIỂM TRA CODE TRÙNG VỚI PROMOTION KHÁC
        // -------------------------------------------------

        if (!existingPromotion
                .getCode()
                .equalsIgnoreCase(newCode)) {

            if (promotionRepository
                    .existsByCode(newCode)) {

                throw new RuntimeException(
                        "Mã khuyến mại "
                                + newCode
                                + " đã tồn tại"
                );
            }
        }


        // -------------------------------------------------
        // CẬP NHẬT THÔNG TIN
        // -------------------------------------------------

        existingPromotion.setName(
                requestPromotion.getName().trim()
        );

        existingPromotion.setCode(
                newCode
        );

        existingPromotion.setDiscountType(
                requestPromotion
                        .getDiscountType()
                        .trim()
                        .toUpperCase()
        );

        existingPromotion.setDiscountValue(
                requestPromotion.getDiscountValue()
        );

        existingPromotion.setMaxDiscount(
                requestPromotion.getMaxDiscount()
        );

        existingPromotion.setMinOrderAmount(
                requestPromotion.getMinOrderAmount()
        );

        existingPromotion.setUsageLimit(
                requestPromotion.getUsageLimit()
        );

        existingPromotion.setStartDate(
                requestPromotion.getStartDate()
        );

        existingPromotion.setEndDate(
                requestPromotion.getEndDate()
        );

        existingPromotion.setStatus(
                requestPromotion
                        .getStatus()
                        .trim()
                        .toUpperCase()
        );


        // -------------------------------------------------
        // CẬP NHẬT SCOPE
        // -------------------------------------------------

        String scopeType =
                normalizeScope(
                        requestPromotion.getScopeType()
                );

        existingPromotion.setScopeType(
                scopeType
        );


        // -------------------------------------------------
        // KHÔNG CHO SỬA USED COUNT
        // -------------------------------------------------
        //
        // usedCount phải phản ánh số lượt sử dụng thật.
        //
        // Admin chỉ được sửa usageLimit.
        //
        // -------------------------------------------------


        // -------------------------------------------------
        // LƯU PROMOTION
        // -------------------------------------------------

        Promotion savedPromotion =
                promotionRepository.save(
                        existingPromotion
                );


        // -------------------------------------------------
        // XÓA PHẠM VI CŨ
        // -------------------------------------------------

        promotionCategoryRepository
                .deleteByPromotionId(id);

        promotionProductRepository
                .deleteByPromotionId(id);


        // -------------------------------------------------
        // LƯU PHẠM VI MỚI
        // -------------------------------------------------

        savePromotionScope(
                savedPromotion,
                categoryIds,
                productIds
        );


        return savedPromotion;
    }


    // =====================================================
// XÓA PROMOTION
// =====================================================
//
// QUY TẮC:
//
// 1. Promotion chưa từng được sử dụng
//    → Được phép xóa.
//
// 2. Promotion đã từng được sử dụng
//    → Không được xóa.
//
// Vì promotion_usages lưu lịch sử sử dụng
// của khách hàng và liên kết với đơn hàng.
//
// =====================================================

    @Transactional
    public void deletePromotion(
            Long id
    ) {

        // -------------------------------------------------
        // 1. TÌM PROMOTION
        // -------------------------------------------------

        Promotion promotion =
                getPromotionById(id);


        // -------------------------------------------------
        // 2. KIỂM TRA LỊCH SỬ SỬ DỤNG
        // -------------------------------------------------
        //
        // Không chỉ dựa vào usedCount.
        //
        // Kiểm tra trực tiếp bảng promotion_usages
        // để tránh trường hợp usedCount không đồng bộ.
        //
        // -------------------------------------------------

        boolean hasUsage =
                promotionUsageRepository
                        .existsByPromotionId(id);


        if (hasUsage) {

            throw new RuntimeException(
                    "Không thể xóa khuyến mại đã phát sinh "
                            + "lịch sử sử dụng. "
                            + "Hãy chuyển trạng thái sang INACTIVE."
            );
        }


        // -------------------------------------------------
        // 3. XÓA CATEGORY MAPPING
        // -------------------------------------------------

        promotionCategoryRepository
                .deleteByPromotionId(id);


        // -------------------------------------------------
        // 4. XÓA PRODUCT MAPPING
        // -------------------------------------------------

        promotionProductRepository
                .deleteByPromotionId(id);


        // -------------------------------------------------
        // 5. XÓA PROMOTION
        // -------------------------------------------------

        promotionRepository.delete(
                promotion
        );
    }




    // =====================================================
    // LƯU PHẠM VI PROMOTION
    // =====================================================

    private void savePromotionScope(
            Promotion promotion,
            List<Long> categoryIds,
            List<Long> productIds
    ) {

        String scopeType =
                promotion.getScopeType();


        // =================================================
        // ALL
        // =================================================

        if ("ALL".equals(scopeType)) {

            // Không cần lưu category/product.

            return;
        }


        // =================================================
        // CATEGORY
        // =================================================

        if ("CATEGORY".equals(scopeType)) {

            if (categoryIds == null
                    || categoryIds.isEmpty()) {

                throw new RuntimeException(
                        "Vui lòng chọn ít nhất một danh mục"
                );
            }


            // -------------------------------------------------
            // XÓA ID TRÙNG
            // -------------------------------------------------

            List<Long> distinctCategoryIds =
                    categoryIds
                            .stream()
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.toList());


            for (Long categoryId :
                    distinctCategoryIds) {

                Category category =
                        categoryRepository
                                .findById(categoryId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Không tìm thấy danh mục với id: "
                                                        + categoryId
                                        )
                                );


                PromotionCategory
                        promotionCategory =
                        new PromotionCategory();

                promotionCategory.setPromotion(
                        promotion
                );

                promotionCategory.setCategory(
                        category
                );


                promotionCategoryRepository.save(
                        promotionCategory
                );
            }

            return;
        }


        // =================================================
        // PRODUCT
        // =================================================

        if ("PRODUCT".equals(scopeType)) {

            if (productIds == null
                    || productIds.isEmpty()) {

                throw new RuntimeException(
                        "Vui lòng chọn ít nhất một sản phẩm"
                );
            }


            // -------------------------------------------------
            // XÓA ID TRÙNG
            // -------------------------------------------------

            List<Long> distinctProductIds =
                    productIds
                            .stream()
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.toList());


            for (Long productId :
                    distinctProductIds) {

                Product product =
                        productRepository
                                .findById(productId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Không tìm thấy sản phẩm với id: "
                                                        + productId
                                        )
                                );


                PromotionProduct
                        promotionProduct =
                        new PromotionProduct();

                promotionProduct.setPromotion(
                        promotion
                );

                promotionProduct.setProduct(
                        product
                );


                promotionProductRepository.save(
                        promotionProduct
                );
            }

            return;
        }


        // =================================================
        // SCOPE KHÔNG HỢP LỆ
        // =================================================

        throw new RuntimeException(
                "Phạm vi khuyến mại không hợp lệ"
        );
    }


    // =====================================================
    // VALIDATE DỮ LIỆU PROMOTION
    // =====================================================

    private void validatePromotionData(
            Promotion promotion
    ) {

        if (promotion == null) {

            throw new RuntimeException(
                    "Thông tin khuyến mại không hợp lệ"
            );
        }


        // -------------------------------------------------
        // NAME
        // -------------------------------------------------

        if (promotion.getName() == null
                || promotion.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Tên khuyến mại không được để trống"
            );
        }


        // -------------------------------------------------
        // CODE
        // -------------------------------------------------

        if (promotion.getCode() == null
                || promotion.getCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Mã khuyến mại không được để trống"
            );
        }


        // -------------------------------------------------
        // DISCOUNT TYPE
        // -------------------------------------------------

        if (promotion.getDiscountType() == null
                || promotion.getDiscountType()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Loại khuyến mại không được để trống"
            );
        }


        String discountType =
                promotion.getDiscountType()
                        .trim()
                        .toUpperCase();


        if (!"PERCENT".equals(discountType)
                && !"FIXED".equals(discountType)) {

            throw new RuntimeException(
                    "Loại khuyến mại không hợp lệ"
            );
        }


        // -------------------------------------------------
        // DISCOUNT VALUE
        // -------------------------------------------------

        if (promotion.getDiscountValue() == null
                || promotion.getDiscountValue()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Giá trị giảm phải lớn hơn 0"
            );
        }


        // -------------------------------------------------
        // PERCENT <= 100
        // -------------------------------------------------

        if ("PERCENT".equals(discountType)
                && promotion.getDiscountValue()
                .compareTo(BigDecimal.valueOf(100)) > 0) {

            throw new RuntimeException(
                    "Giảm theo phần trăm không được lớn hơn 100%"
            );
        }


        // -------------------------------------------------
        // MAX DISCOUNT
        // -------------------------------------------------

        if (promotion.getMaxDiscount() != null
                && promotion.getMaxDiscount()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Mức giảm tối đa không được âm"
            );
        }


        // -------------------------------------------------
        // MIN ORDER
        // -------------------------------------------------

        if (promotion.getMinOrderAmount() == null) {

            promotion.setMinOrderAmount(
                    BigDecimal.ZERO
            );
        }


        if (promotion.getMinOrderAmount()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Giá trị đơn hàng tối thiểu không được âm"
            );
        }


        // -------------------------------------------------
        // USAGE LIMIT
        // -------------------------------------------------

        if (promotion.getUsageLimit() == null
                || promotion.getUsageLimit() <= 0) {

            throw new RuntimeException(
                    "Giới hạn lượt sử dụng phải lớn hơn 0"
            );
        }


        // -------------------------------------------------
        // NGÀY BẮT ĐẦU / KẾT THÚC
        // -------------------------------------------------

        if (promotion.getStartDate() == null
                || promotion.getEndDate() == null) {

            throw new RuntimeException(
                    "Ngày bắt đầu và ngày kết thúc không được để trống"
            );
        }


        if (promotion.getEndDate()
                .isBefore(
                        promotion.getStartDate()
                )) {

            throw new RuntimeException(
                    "Ngày kết thúc phải sau ngày bắt đầu"
            );
        }


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (promotion.getStatus() == null
                || promotion.getStatus()
                .trim()
                .isEmpty()) {

            promotion.setStatus(
                    "ACTIVE"
            );
        }


        String status =
                promotion.getStatus()
                        .trim()
                        .toUpperCase();


        if (!"ACTIVE".equals(status)
                && !"INACTIVE".equals(status)) {

            throw new RuntimeException(
                    "Trạng thái khuyến mại không hợp lệ"
            );
        }


        promotion.setStatus(status);
        promotion.setDiscountType(discountType);
    }


    // =====================================================
    // CHUẨN HÓA SCOPE
    // =====================================================

    private String normalizeScope(
            String scopeType
    ) {

        if (scopeType == null
                || scopeType.trim().isEmpty()) {

            return "ALL";
        }


        String normalized =
                scopeType.trim().toUpperCase();


        if (!"ALL".equals(normalized)
                && !"CATEGORY".equals(normalized)
                && !"PRODUCT".equals(normalized)) {

            throw new RuntimeException(
                    "Phạm vi khuyến mại không hợp lệ"
            );
        }


        return normalized;
    }


    // =====================================================
    // =====================================================
    // PHẦN 2 - CHECKOUT / VALIDATE PROMOTION
    // =====================================================
    // =====================================================


    // =====================================================
    // TÌM KHUYẾN MẠI THEO MÃ
    // =====================================================

    public Promotion findByCode(String code) {

        if (code == null
                || code.trim().isEmpty()) {

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

    public Promotion validatePromotion(
            String code,
            BigDecimal orderAmount,
            Long customerId
    ) {

        // -------------------------------------------------
        // 1. KIỂM TRA CODE
        // -------------------------------------------------

        if (code == null
                || code.trim().isEmpty()) {

            throw new RuntimeException(
                    "Vui lòng nhập mã khuyến mại"
            );
        }


        // -------------------------------------------------
        // 2. CUSTOMER
        // -------------------------------------------------

        if (customerId == null) {

            throw new RuntimeException(
                    "Không xác định được khách hàng"
            );
        }


        // -------------------------------------------------
        // 3. CHUẨN HÓA CODE
        // -------------------------------------------------

        String normalizedCode =
                code.trim().toUpperCase();


        // -------------------------------------------------
        // 4. TÌM PROMOTION
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
        // 5. STATUS
        // -------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                promotion.getStatus()
        )) {

            throw new RuntimeException(
                    "Mã khuyến mại hiện không hoạt động"
            );
        }


        // -------------------------------------------------
        // 6. THỜI GIAN
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
        // 7. USAGE LIMIT
        // -------------------------------------------------

        if (promotion.getUsedCount()
                >= promotion.getUsageLimit()) {

            throw new RuntimeException(
                    "Mã khuyến mại đã hết lượt sử dụng"
            );
        }


        // -------------------------------------------------
        // 8. ORDER AMOUNT
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
        // 9. KIỂM TRA KHÁCH ĐÃ DÙNG
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
        // PERCENT
        // -------------------------------------------------

        if ("PERCENT".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            discount =
                    orderAmount
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
        // FIXED
        // -------------------------------------------------

        else if ("FIXED".equalsIgnoreCase(
                promotion.getDiscountType()
        )) {

            discount =
                    promotion.getDiscountValue();
        }


        // -------------------------------------------------
        // INVALID
        // -------------------------------------------------

        else {

            throw new RuntimeException(
                    "Loại khuyến mại không hợp lệ"
            );
        }


        // -------------------------------------------------
        // MAX DISCOUNT
        // -------------------------------------------------

        if (promotion.getMaxDiscount() != null
                && discount.compareTo(
                promotion.getMaxDiscount()
        ) > 0) {

            discount =
                    promotion.getMaxDiscount();
        }


        // -------------------------------------------------
        // KHÔNG GIẢM QUÁ GIÁ TRỊ ĐƯỢC ÁP DỤNG
        // -------------------------------------------------

        if (discount.compareTo(
                orderAmount
        ) > 0) {

            discount =
                    orderAmount;
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

            discount =
                    BigDecimal.ZERO;
        }


        BigDecimal finalAmount =
                orderAmount.subtract(
                        discount
                );


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
    // KIỂM TRA SẢN PHẨM ĐƯỢC ÁP DỤNG KHUYẾN MẠI
    // =====================================================

    public boolean isProductEligible(
            Promotion promotion,
            Long productId,
            Long categoryId
    ) {

        if (promotion == null) {

            return false;
        }


        if (productId == null) {

            return false;
        }


        String scopeType =
                promotion.getScopeType();


        // -------------------------------------------------
        // ALL
        // -------------------------------------------------

        if ("ALL".equalsIgnoreCase(
                scopeType
        )) {

            return true;
        }


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if ("CATEGORY".equalsIgnoreCase(
                scopeType
        )) {

            if (categoryId == null) {

                return false;
            }


            return promotionCategoryRepository
                    .existsByPromotionIdAndCategoryId(
                            promotion.getId(),
                            categoryId
                    );
        }


        // -------------------------------------------------
        // PRODUCT
        // -------------------------------------------------

        if ("PRODUCT".equalsIgnoreCase(
                scopeType
        )) {

            return promotionProductRepository
                    .existsByPromotionIdAndProductId(
                            promotion.getId(),
                            productId
                    );
        }


        return false;
    }


    // =====================================================
    // ALIAS
    // =====================================================

    public boolean isPromotionApplicableToProduct(
            Promotion promotion,
            Long productId,
            Long categoryId
    ) {

        return isProductEligible(
                promotion,
                productId,
                categoryId
        );
    }


    // =====================================================
    // KIỂM TRA CODE TỒN TẠI
    // =====================================================

    public boolean existsByCode(
            String code
    ) {

        if (code == null
                || code.trim().isEmpty()) {

            return false;
        }


        return promotionRepository
                .existsByCode(
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