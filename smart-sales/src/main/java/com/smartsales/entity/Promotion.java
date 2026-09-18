
package com.smartsales.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
public class Promotion {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // THÔNG TIN KHUYẾN MẠI
    // =====================================================

    // Tên chương trình khuyến mại
    // Ví dụ: Khuyến mại tháng 9
    @Column(nullable = false, length = 150)
    private String name;


    // Mã giảm giá khách nhập ở Checkout
    // Ví dụ: SMART9
    // unique = true để không có 2 chương trình cùng mã
    @Column(nullable = false, unique = true, length = 50)
    private String code;


    // Loại giảm giá:
    // PERCENT = giảm theo %
    // FIXED   = giảm số tiền cố định
    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType;


    // Giá trị giảm
    //
    // Nếu PERCENT:
    // 10 = giảm 10%
    //
    // Nếu FIXED:
    // 50000 = giảm 50.000đ
    @Column(
            name = "discount_value",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal discountValue;


    // Mức giảm tối đa
    //
    // Ví dụ:
    // Giảm 10%, tối đa 100.000đ
    //
    // Với mã FIXED có thể để null.
    @Column(
            name = "max_discount",
            precision = 15,
            scale = 2
    )
    private BigDecimal maxDiscount;


    // Giá trị đơn hàng tối thiểu
    //
    // Ví dụ:
    // Đơn từ 500.000đ mới được dùng mã.
    @Column(
            name = "min_order_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal minOrderAmount = BigDecimal.ZERO;


    // =====================================================
    // GIỚI HẠN SỬ DỤNG
    // =====================================================

    // Tổng số lượt mã được sử dụng
    // Ví dụ: 500 lượt
    @Column(name = "usage_limit", nullable = false)
    private Integer usageLimit;


    // Số lượt đã sử dụng
    // Ban đầu = 0
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;


    // =====================================================
    // THỜI GIAN KHUYẾN MẠI
    // =====================================================

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;


    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;


    // =====================================================
    // TRẠNG THÁI
    // =====================================================

    // ACTIVE   = đang hoạt động
    // INACTIVE = đã tắt
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";


    // =====================================================
    // THỜI GIAN TẠO / CẬP NHẬT
    // =====================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Promotion() {
    }


    // =====================================================
    // GETTER / SETTER
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


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

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }


    public BigDecimal getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(BigDecimal maxDiscount) {
        this.maxDiscount = maxDiscount;
    }


    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }


    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }


    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }


    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }


    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    // =====================================================
    // TỰ ĐỘNG GÁN THỜI GIAN
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (usedCount == null) {
            usedCount = 0;
        }

        if (minOrderAmount == null) {
            minOrderAmount = BigDecimal.ZERO;
        }

        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}

