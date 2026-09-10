package com.smartsales.repository;

import com.smartsales.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // =====================================================
    // LẤY TẤT CẢ ĐƠN HÀNG
    // Kèm Customer + OrderDetail + Product
    // =====================================================

    @Override
    @EntityGraph(attributePaths = {
            "customer",
            "orderDetails",
            "orderDetails.product"
    })
    List<Order> findAll();


    // =====================================================
    // LẤY ĐƠN HÀNG CỦA CUSTOMER
    // Kèm Customer + OrderDetail + Product
    // =====================================================

    @EntityGraph(attributePaths = {
            "customer",
            "orderDetails",
            "orderDetails.product"
    })
    List<Order> findByCustomerId(Long customerId);
}