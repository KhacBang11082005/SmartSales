package com.smartsales.repository;

import com.smartsales.dto.TopProductStatistics;
import com.smartsales.entity.Order;
import com.smartsales.entity.OrderDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.math.BigDecimal;
import java.util.List;

public interface StatisticsRepository extends Repository<Order, Long> {

    // Tổng số đơn hàng
    @Query("""
            SELECT COUNT(o)
            FROM Order o
            """)
    Long countTotalOrders();

    // Tổng số đơn đã hoàn thành
    @Query("""
            SELECT COUNT(o)
            FROM Order o
            WHERE o.status = :status
            """)
    Long countOrdersByStatus(Order.Status status);

    // Tổng doanh thu của các đơn hoàn thành
    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM Order o
            WHERE o.status = com.smartsales.entity.Order.Status.COMPLETED
            """)
    BigDecimal getTotalRevenue();

    // Tổng số sản phẩm đã bán
    @Query("""
            SELECT COALESCE(SUM(od.quantity), 0)
            FROM OrderDetail od
            WHERE od.order.status =
                  com.smartsales.entity.Order.Status.COMPLETED
            """)
    Long getTotalProductsSold();
    // Top các sản phẩm bán chạy
    @Query("""
        SELECT new com.smartsales.dto.TopProductStatistics(
            od.product.id,
            od.product.name,
            SUM(od.quantity),
            SUM(od.subtotal)
        )
        FROM OrderDetail od
        WHERE od.order.status =
              com.smartsales.entity.Order.Status.COMPLETED
        GROUP BY od.product.id, od.product.name
        ORDER BY SUM(od.quantity) DESC
        """)
    List<TopProductStatistics> findTopSellingProducts(
            org.springframework.data.domain.Pageable pageable
    );
}