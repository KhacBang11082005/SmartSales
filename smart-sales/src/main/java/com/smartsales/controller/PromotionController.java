package com.smartsales.controller;

import com.smartsales.dto.PromotionValidateResponse;
import com.smartsales.entity.Promotion;
import com.smartsales.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin
public class PromotionController {

    private final PromotionService promotionService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionController(
            PromotionService promotionService
    ) {
        this.promotionService = promotionService;
    }


    // =====================================================
    // KIỂM TRA MÃ KHUYẾN MẠI
    // =====================================================
    //
    // POST:
    // /api/promotions/validate
    //
    // Body:
    // {
    //     "code": "SMART9",
    //     "orderAmount": 1500000,
    //     "customerId": 1
    // }
    //
    // =====================================================

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromotion(
            @RequestBody PromotionValidateRequest request
    ) {

        try {

            // ---------------------------------------------
            // 1. Kiểm tra request
            // ---------------------------------------------

            if (request == null) {

                return ResponseEntity.badRequest().body(
                        createErrorResponse(
                                "Dữ liệu không hợp lệ"
                        )
                );
            }


            // ---------------------------------------------
            // 2. Kiểm tra mã
            // ---------------------------------------------

            if (request.getCode() == null
                    || request.getCode().trim().isEmpty()) {

                return ResponseEntity.badRequest().body(
                        createErrorResponse(
                                "Vui lòng nhập mã khuyến mại"
                        )
                );
            }


            // ---------------------------------------------
            // 3. Kiểm tra giá trị đơn hàng
            // ---------------------------------------------

            if (request.getOrderAmount() == null
                    || request.getOrderAmount()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                return ResponseEntity.badRequest().body(
                        createErrorResponse(
                                "Giá trị đơn hàng không hợp lệ"
                        )
                );
            }


            // ---------------------------------------------
            // 4. Kiểm tra customerId
            // ---------------------------------------------

            if (request.getCustomerId() == null) {

                return ResponseEntity.badRequest().body(
                        createErrorResponse(
                                "Không xác định được khách hàng"
                        )
                );
            }


            // ---------------------------------------------
            // 5. KIỂM TRA MÃ KHUYẾN MẠI
            // ---------------------------------------------
            //
            // Quan trọng:
            // Phải nhận Promotion mà Service trả về.
            //
            // ---------------------------------------------

            Promotion promotion =
                    promotionService.validatePromotion(
                            request.getCode(),
                            request.getOrderAmount(),
                            request.getCustomerId()
                    );


            // ---------------------------------------------
            // 6. TÍNH TIỀN GIẢM
            // ---------------------------------------------

            BigDecimal discountAmount =
                    promotionService.calculateDiscount(
                            promotion,
                            request.getOrderAmount()
                    );


            // ---------------------------------------------
            // 7. TÍNH TỔNG TIỀN SAU GIẢM
            // ---------------------------------------------

            BigDecimal finalAmount =
                    promotionService.calculateFinalAmount(
                            request.getOrderAmount(),
                            discountAmount
                    );


            // ---------------------------------------------
            // 8. TẠO RESPONSE
            // ---------------------------------------------

            PromotionValidateResponse response =
                    new PromotionValidateResponse();

            response.setValid(true);

            response.setMessage(
                    "Áp dụng mã khuyến mại thành công"
            );

            response.setPromotionId(
                    promotion.getId()
            );

            response.setCode(
                    promotion.getCode()
            );

            response.setName(
                    promotion.getName()
            );

            response.setDiscountType(
                    promotion.getDiscountType()
            );

            response.setDiscountValue(
                    promotion.getDiscountValue()
            );

            response.setOrderAmount(
                    request.getOrderAmount()
            );

            response.setDiscountAmount(
                    discountAmount
            );

            response.setFinalAmount(
                    finalAmount
            );


            return ResponseEntity.ok(response);


        } catch (RuntimeException e) {

            // ---------------------------------------------
            // MÃ KHÔNG HỢP LỆ
            // ---------------------------------------------

            return ResponseEntity.badRequest().body(
                    createErrorResponse(
                            e.getMessage()
                    )
            );
        }
    }


    // =====================================================
    // RESPONSE KHI CÓ LỖI
    // =====================================================

    private PromotionValidateResponse createErrorResponse(
            String message
    ) {

        PromotionValidateResponse response =
                new PromotionValidateResponse();

        response.setValid(false);

        response.setMessage(message);

        return response;
    }


    // =====================================================
    // REQUEST DTO
    // =====================================================

    public static class PromotionValidateRequest {

        private String code;

        private BigDecimal orderAmount;

        // ID khách hàng
        private Long customerId;


        // =================================================
        // CONSTRUCTOR
        // =================================================

        public PromotionValidateRequest() {
        }


        // =================================================
        // GETTER / SETTER
        // =================================================

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }


        public BigDecimal getOrderAmount() {
            return orderAmount;
        }

        public void setOrderAmount(
                BigDecimal orderAmount
        ) {
            this.orderAmount = orderAmount;
        }


        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(
                Long customerId
        ) {
            this.customerId = customerId;
        }
    }
}