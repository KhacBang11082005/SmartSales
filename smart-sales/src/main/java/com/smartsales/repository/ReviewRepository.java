package com.smartsales.repository;

import com.smartsales.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /*
     * =========================================================
     * REVIEW THEO ORDER DETAIL
     * =========================================================
     *
     * Đây là phương thức quan trọng cho chức năng mới:
     *
     * Order #1001 -> Product A -> Review A
     * Order #1002 -> Product A -> Review B
     *
     * Hai review có cùng customer + product nhưng khác orderDetail.
     */

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "product",
            "orderDetail",
            "media"
    })
    Optional<Review> findByOrderDetailId(Long orderDetailId);


    /*
     * =========================================================
     * CÁC PHƯƠNG THỨC CŨ
     * =========================================================
     *
     * Giữ lại để không làm hỏng các chức năng review hiện tại,
     * đặc biệt là hiển thị review theo sản phẩm và các review cũ
     * đang có order_detail_id = NULL.
     */

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "media"
    })
    Optional<Review> findByCustomerIdAndProductId(
            Long customerId,
            Long productId
    );


    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "media"
    })
    List<Review> findByProductIdOrderByCreatedAtDesc(
            Long productId
    );


    long countByProductId(Long productId);


    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM Review r
            WHERE r.product.id = :productId
            """)
    Double getAverageRating(
            @Param("productId") Long productId
    );


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


    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "product",
            "orderDetail",
            "media"
    })
    Optional<Review> findReviewById(
            Long reviewId
    );


    /*
     * =========================================================
     * REVIEW CỦA MỘT CUSTOMER
     * =========================================================
     *
     * Dùng cho phần lịch sử đánh giá của khách hàng/admin.
     */

    @EntityGraph(attributePaths = {
            "customer",
            "customer.user",
            "product",
            "orderDetail",
            "media"
    })
    List<Review> findByCustomerId(Long customerId);


    /*
     * =========================================================
     * PHÂN BỐ SỐ SAO
     * =========================================================
     */

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