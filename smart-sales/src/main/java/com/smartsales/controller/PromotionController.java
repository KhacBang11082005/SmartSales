package com.smartsales.controller;

import com.smartsales.entity.Product;
import com.smartsales.entity.Promotion;
import com.smartsales.service.PromotionService;

import com.smartsales.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "http://localhost:5173")
public class PromotionController {

    private final PromotionService promotionService;

    private final ProductRepository productRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionController(
            PromotionService promotionService,
            ProductRepository productRepository
    ) {
        this.promotionService = promotionService;
        this.productRepository = productRepository;
    }


    // =====================================================
    // =====================================================
    // ADMIN - LẤY DANH SÁCH KHUYẾN MẠI
    // =====================================================
    // GET /api/promotions
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllPromotions() {

        try {

            List<Promotion> promotions =
                    promotionService.getAllPromotions();

            List<Map<String, Object>> result =
                    new ArrayList<>();


            for (Promotion promotion : promotions) {

                Map<String, Object> item =
                        buildPromotionResponse(
                                promotion
                        );

                result.add(item);
            }


            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // ADMIN - LẤY CHI TIẾT KHUYẾN MẠI
    // =====================================================
    // GET /api/promotions/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPromotionById(
            @PathVariable Long id
    ) {

        try {

            Promotion promotion =
                    promotionService
                            .getPromotionById(id);


            return ResponseEntity.ok(
                    buildPromotionResponse(
                            promotion
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // ADMIN - TẠO KHUYẾN MẠI
    // =====================================================
    // POST /api/promotions
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createPromotion(
            @RequestBody PromotionAdminRequest request
    ) {

        try {

            // -------------------------------------------------
            // KIỂM TRA REQUEST
            // -------------------------------------------------

            if (request == null) {

                throw new RuntimeException(
                        "Dữ liệu khuyến mại không hợp lệ"
                );
            }


            // -------------------------------------------------
            // TẠO ENTITY
            // -------------------------------------------------

            Promotion promotion =
                    request.toPromotion();


            // -------------------------------------------------
            // GỌI SERVICE
            // -------------------------------------------------

            Promotion savedPromotion =
                    promotionService.createPromotion(
                            promotion,
                            request.getCategoryIds(),
                            request.getProductIds()
                    );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            buildPromotionResponse(
                                    savedPromotion
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // ADMIN - CẬP NHẬT KHUYẾN MẠI
    // =====================================================
    // PUT /api/promotions/{id}
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionAdminRequest request
    ) {

        try {

            // -------------------------------------------------
            // KIỂM TRA REQUEST
            // -------------------------------------------------

            if (request == null) {

                throw new RuntimeException(
                        "Dữ liệu khuyến mại không hợp lệ"
                );
            }


            // -------------------------------------------------
            // ENTITY
            // -------------------------------------------------

            Promotion promotion =
                    request.toPromotion();


            // -------------------------------------------------
            // UPDATE
            // -------------------------------------------------

            Promotion updatedPromotion =
                    promotionService.updatePromotion(
                            id,
                            promotion,
                            request.getCategoryIds(),
                            request.getProductIds()
                    );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return ResponseEntity.ok(
                    buildPromotionResponse(
                            updatedPromotion
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // ADMIN - XÓA KHUYẾN MẠI
    // =====================================================
    // DELETE /api/promotions/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(
            @PathVariable Long id
    ) {

        try {

            promotionService.deletePromotion(id);


            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Xóa khuyến mại thành công"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // CHECKOUT - VALIDATE KHUYẾN MẠI
    // =====================================================
    //
    // API này là API CŨ ĐANG ĐƯỢC CHECKOUT SỬ DỤNG.
    //
    // KHÔNG XÓA.
    //
    // POST /api/promotions/validate
    //
    // =====================================================

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromotion(
            @RequestBody PromotionValidateRequest request
    ) {

        try {

            // -------------------------------------------------
            // KIỂM TRA REQUEST
            // -------------------------------------------------

            if (request == null) {

                throw new RuntimeException(
                        "Dữ liệu không hợp lệ"
                );
            }


            if (request.getCode() == null
                    || request.getCode()
                    .trim()
                    .isEmpty()) {

                throw new RuntimeException(
                        "Vui lòng nhập mã khuyến mại"
                );
            }


            if (request.getCustomerId() == null) {

                throw new RuntimeException(
                        "Không xác định được khách hàng"
                );
            }


            if (request.getItems() == null
                    || request.getItems().isEmpty()) {

                throw new RuntimeException(
                        "Không có sản phẩm để áp dụng khuyến mại"
                );
            }


            // -------------------------------------------------
            // TÌM PROMOTION
            // -------------------------------------------------

            Promotion promotion =
                    promotionService.findByCode(
                            request.getCode()
                    );


            if (promotion == null) {

                throw new RuntimeException(
                        "Mã khuyến mại không tồn tại"
                );
            }


            // -------------------------------------------------
            // TÍNH LẠI GIÁ TRỊ ĐƠN HÀNG
            // -------------------------------------------------
            //
            // KHÔNG tin orderAmount từ frontend.
            //
            // Giá sản phẩm lấy trực tiếp từ DB.
            //
            // -------------------------------------------------

            BigDecimal actualOrderAmount =
                    BigDecimal.ZERO;


            BigDecimal eligiblePromotionAmount =
                    BigDecimal.ZERO;


            // -------------------------------------------------
            // DUYỆT TỪNG SẢN PHẨM
            // -------------------------------------------------

            for (PromotionItemRequest item :
                    request.getItems()) {

                if (item.getProductId() == null) {

                    throw new RuntimeException(
                            "Sản phẩm không hợp lệ"
                    );
                }


                if (item.getQuantity() == null
                        || item.getQuantity() <= 0) {

                    throw new RuntimeException(
                            "Số lượng sản phẩm không hợp lệ"
                    );
                }


                // -------------------------------------------------
                // LẤY PRODUCT TỪ DB
                // -------------------------------------------------

                Product product =
                        productRepository
                                .findById(
                                        item.getProductId()
                                )
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Không tìm thấy sản phẩm với id: "
                                                        + item.getProductId()
                                        )
                                );


                // -------------------------------------------------
                // SẢN PHẨM PHẢI ACTIVE
                // -------------------------------------------------

                if (product.getStatus()
                        != Product.Status.ACTIVE) {

                    throw new RuntimeException(
                            "Sản phẩm "
                                    + product.getName()
                                    + " hiện không kinh doanh"
                    );
                }


                // -------------------------------------------------
                // GIÁ LẤY TỪ DATABASE
                // -------------------------------------------------

                BigDecimal subtotal =
                        product.getPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                item.getQuantity()
                                        )
                                );


                // -------------------------------------------------
                // TỔNG ĐƠN HÀNG THỰC TẾ
                // -------------------------------------------------

                actualOrderAmount =
                        actualOrderAmount.add(
                                subtotal
                        );


                // -------------------------------------------------
                // CATEGORY ID
                // -------------------------------------------------

                Long categoryId = null;

                if (product.getCategory() != null) {

                    categoryId =
                            product.getCategory().getId();
                }


                // -------------------------------------------------
                // KIỂM TRA SẢN PHẨM ĐƯỢC ÁP DỤNG
                // -------------------------------------------------

                boolean eligible =
                        promotionService
                                .isPromotionApplicableToProduct(
                                        promotion,
                                        product.getId(),
                                        categoryId
                                );


                if (eligible) {

                    eligiblePromotionAmount =
                            eligiblePromotionAmount.add(
                                    subtotal
                            );
                }
            }


            // -------------------------------------------------
            // KIỂM TRA TỔNG
            // -------------------------------------------------

            if (actualOrderAmount
                    .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Giá trị đơn hàng không hợp lệ"
                );
            }


            // -------------------------------------------------
            // PHẢI CÓ SẢN PHẨM ĐƯỢC ÁP DỤNG
            // -------------------------------------------------

            if (eligiblePromotionAmount
                    .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Mã khuyến mại không áp dụng cho sản phẩm đã chọn"
                );
            }


            // -------------------------------------------------
            // VALIDATE PROMOTION
            // -------------------------------------------------

            Promotion validPromotion =
                    promotionService.validatePromotion(
                            promotion.getCode(),
                            eligiblePromotionAmount,
                            request.getCustomerId()
                    );


            // -------------------------------------------------
            // TÍNH GIẢM
            // -------------------------------------------------

            BigDecimal discountAmount =
                    promotionService.calculateDiscount(
                            validPromotion,
                            eligiblePromotionAmount
                    );


            // -------------------------------------------------
            // TÍNH TỔNG CUỐI
            // -------------------------------------------------

            BigDecimal finalAmount =
                    promotionService.calculateFinalAmount(
                            actualOrderAmount,
                            discountAmount
                    );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();


            response.put(
                    "valid",
                    true
            );

            response.put(
                    "message",
                    "Áp dụng mã khuyến mại thành công"
            );

            response.put(
                    "promotionId",
                    validPromotion.getId()
            );

            response.put(
                    "code",
                    validPromotion.getCode()
            );

            response.put(
                    "name",
                    validPromotion.getName()
            );

            response.put(
                    "discountType",
                    validPromotion.getDiscountType()
            );

            response.put(
                    "discountValue",
                    validPromotion.getDiscountValue()
            );

            response.put(
                    "orderAmount",
                    actualOrderAmount
            );

            response.put(
                    "discountAmount",
                    discountAmount
            );

            response.put(
                    "finalAmount",
                    finalAmount
            );


            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "valid",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // =====================================================
    // TẠO RESPONSE CHO ADMIN
    // =====================================================
    // =====================================================

    private Map<String, Object> buildPromotionResponse(
            Promotion promotion
    ) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "id",
                promotion.getId()
        );

        response.put(
                "name",
                promotion.getName()
        );

        response.put(
                "code",
                promotion.getCode()
        );

        response.put(
                "discountType",
                promotion.getDiscountType()
        );

        response.put(
                "discountValue",
                promotion.getDiscountValue()
        );

        response.put(
                "maxDiscount",
                promotion.getMaxDiscount()
        );

        response.put(
                "minOrderAmount",
                promotion.getMinOrderAmount()
        );

        response.put(
                "usageLimit",
                promotion.getUsageLimit()
        );

        response.put(
                "usedCount",
                promotion.getUsedCount()
        );

        response.put(
                "startDate",
                promotion.getStartDate()
        );

        response.put(
                "endDate",
                promotion.getEndDate()
        );

        response.put(
                "status",
                promotion.getStatus()
        );

        response.put(
                "scopeType",
                promotion.getScopeType()
        );


        // -------------------------------------------------
        // CATEGORY IDS
        // -------------------------------------------------

        response.put(
                "categoryIds",
                promotionService
                        .getPromotionCategoryIds(
                                promotion.getId()
                        )
        );


        // -------------------------------------------------
        // PRODUCT IDS
        // -------------------------------------------------

        response.put(
                "productIds",
                promotionService
                        .getPromotionProductIds(
                                promotion.getId()
                        )
        );


        response.put(
                "createdAt",
                promotion.getCreatedAt()
        );

        response.put(
                "updatedAt",
                promotion.getUpdatedAt()
        );


        return response;
    }


    // =====================================================
    // =====================================================
    // DTO - ADMIN PROMOTION REQUEST
    // =====================================================
    // =====================================================

    public static class PromotionAdminRequest {

        private String name;

        private String code;

        private String discountType;

        private BigDecimal discountValue;

        private BigDecimal maxDiscount;

        private BigDecimal minOrderAmount;

        private Integer usageLimit;

        private LocalDateTime startDate;

        private LocalDateTime endDate;

        private String status;

        private String scopeType;

        private List<Long> categoryIds;

        private List<Long> productIds;


        // =================================================
        // CHUYỂN DTO -> ENTITY
        // =================================================

        public Promotion toPromotion() {

            Promotion promotion =
                    new Promotion();


            promotion.setName(
                    name
            );

            promotion.setCode(
                    code
            );

            promotion.setDiscountType(
                    discountType
            );

            promotion.setDiscountValue(
                    discountValue
            );

            promotion.setMaxDiscount(
                    maxDiscount
            );

            promotion.setMinOrderAmount(
                    minOrderAmount
            );

            promotion.setUsageLimit(
                    usageLimit
            );

            promotion.setStartDate(
                    startDate
            );

            promotion.setEndDate(
                    endDate
            );

            promotion.setStatus(
                    status
            );

            promotion.setScopeType(
                    scopeType
            );


            return promotion;
        }


        // =================================================
        // GETTERS / SETTERS
        // =================================================

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }


        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }


        public String getDiscountType() {
            return discountType;
        }

        public void setDiscountType(String discountType) {
            this.discountType = discountType;
        }


        public BigDecimal getDiscountValue() {
            return discountValue;
        }

        public void setDiscountValue(
                BigDecimal discountValue
        ) {
            this.discountValue =
                    discountValue;
        }


        public BigDecimal getMaxDiscount() {
            return maxDiscount;
        }

        public void setMaxDiscount(
                BigDecimal maxDiscount
        ) {
            this.maxDiscount =
                    maxDiscount;
        }


        public BigDecimal getMinOrderAmount() {
            return minOrderAmount;
        }

        public void setMinOrderAmount(
                BigDecimal minOrderAmount
        ) {
            this.minOrderAmount =
                    minOrderAmount;
        }


        public Integer getUsageLimit() {
            return usageLimit;
        }

        public void setUsageLimit(
                Integer usageLimit
        ) {
            this.usageLimit =
                    usageLimit;
        }


        public LocalDateTime getStartDate() {
            return startDate;
        }

        public void setStartDate(
                LocalDateTime startDate
        ) {
            this.startDate =
                    startDate;
        }


        public LocalDateTime getEndDate() {
            return endDate;
        }

        public void setEndDate(
                LocalDateTime endDate
        ) {
            this.endDate =
                    endDate;
        }


        public String getStatus() {
            return status;
        }

        public void setStatus(
                String status
        ) {
            this.status =
                    status;
        }


        public String getScopeType() {
            return scopeType;
        }

        public void setScopeType(
                String scopeType
        ) {
            this.scopeType =
                    scopeType;
        }


        public List<Long> getCategoryIds() {
            return categoryIds;
        }

        public void setCategoryIds(
                List<Long> categoryIds
        ) {
            this.categoryIds =
                    categoryIds;
        }


        public List<Long> getProductIds() {
            return productIds;
        }

        public void setProductIds(
                List<Long> productIds
        ) {
            this.productIds =
                    productIds;
        }
    }


    // =====================================================
    // =====================================================
    // DTO - VALIDATE PROMOTION
    // =====================================================
    // =====================================================

    public static class PromotionValidateRequest {

        private String code;

        private BigDecimal orderAmount;

        private Long customerId;

        private List<PromotionItemRequest> items;


        public String getCode() {
            return code;
        }

        public void setCode(
                String code
        ) {
            this.code =
                    code;
        }


        public BigDecimal getOrderAmount() {
            return orderAmount;
        }

        public void setOrderAmount(
                BigDecimal orderAmount
        ) {
            this.orderAmount =
                    orderAmount;
        }


        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(
                Long customerId
        ) {
            this.customerId =
                    customerId;
        }


        public List<PromotionItemRequest> getItems() {
            return items;
        }

        public void setItems(
                List<PromotionItemRequest> items
        ) {
            this.items =
                    items;
        }
    }


    // =====================================================
    // DTO - PRODUCT TRONG PROMOTION
    // =====================================================

    public static class PromotionItemRequest {

        private Long productId;

        private Integer quantity;


        public Long getProductId() {
            return productId;
        }

        public void setProductId(
                Long productId
        ) {
            this.productId =
                    productId;
        }


        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(
                Integer quantity
        ) {
            this.quantity =
                    quantity;
        }
    }
}