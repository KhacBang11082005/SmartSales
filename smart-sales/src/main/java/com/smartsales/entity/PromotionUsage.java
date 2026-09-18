package com.smartsales.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "promotion_usages",

        // =================================================
        // MỘT KHÁCH CHỈ ĐƯỢC DÙNG MỘT MÃ MỘT LẦN
        // =================================================
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_promotion_customer",
                        columnNames = {
                                "promotion_id",
                                "customer_id"
                        }
                )
        }
)
public class PromotionUsage {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // CHƯƠNG TRÌNH KHUYẾN MẠI
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "promotion_id",
            nullable = false
    )
    private Promotion promotion;


    // =====================================================
    // KHÁCH HÀNG
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;


    // =====================================================
    // ĐƠN HÀNG
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "order_id",
            nullable = false
    )
    private Order order;


    // =====================================================
    // THỜI GIAN SỬ DỤNG
    // =====================================================

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PromotionUsage() {
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


    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }


    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }


    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }


    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }


    // =====================================================
    // TỰ ĐỘNG GÁN THỜI GIAN
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (usedAt == null) {
            usedAt = LocalDateTime.now();
        }
    }
}

