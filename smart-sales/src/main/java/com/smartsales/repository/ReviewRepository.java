package com.smartsales.repository;

import com.smartsales.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // =========================================================
    // CUSTOMER + PRODUCT
    // =========================================================

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "media"
    })
    Optional<Review> findByCustomerIdAndProductId(
            Long customerId,
            Long productId
    );

    // =========================================================
    // LẤY REVIEW CỦA SẢN PHẨM
    //
    // Fetch luôn:
    // - customer
    // - customer.user
    // - media
    //
    // để Controller có thể trả về đầy đủ thông tin.
    // =========================================================

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "media"
    })
    List<Review> findByProductIdOrderByCreatedAtDesc(
            Long productId
    );

    // =========================================================
    // ĐẾM REVIEW
    // =========================================================

    long countByProductId(Long productId);

    // =========================================================
    // ĐIỂM TRUNG BÌNH
    // =========================================================

    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM Review r
            WHERE r.product.id = :productId
            """)
    Double getAverageRating(
            @Param("productId") Long productId
    );

    // =========================================================
    // KIỂM TRA ĐÃ MUA VÀ ĐƠN ĐÃ HOÀN THÀNH
    // =========================================================

    @Query("""
            SELECT COUNT(od) > 0
            FROM OrderDetail od
            JOIN od.order o
            WHERE o.customer.id = :customerId
              AND od.product.id = :productId
              AND o.status = com.smartsales.entity.Order.Status.COMPLETED
            """)
    boolean hasCompletedPurchase(
            @Param("customerId") Long customerId,
            @Param("productId") Long productId
    );

    // =========================================================
    // LẤY REVIEW THEO ID KÈM CUSTOMER + MEDIA
    // =========================================================

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "media"
    })
    Optional<Review> findReviewById(
            Long reviewId
    );

    @Query("""
        SELECT r.rating, COUNT(r)
        FROM Review r
        WHERE r.product.id = :productId
        GROUP BY r.rating
        ORDER BY r.rating DESC
        """)
    List<Object[]> getRatingDistribution(
            @Param("productId") Long productId
    );
}