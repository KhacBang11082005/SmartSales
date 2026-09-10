package com.smartsales.controller;

import com.smartsales.dto.CreateOrderRequest;
import com.smartsales.entity.Order;
import com.smartsales.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartsales.dto.UpdateShippingRequest;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =====================================================
    // CREATE ORDER
    // =====================================================

    @PostMapping
    public Order createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        return orderService.createOrder(
                request,
                authentication
        );
    }

    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    @GetMapping
    public List<Order> getAllOrders(
            Authentication authentication) {

        return orderService.getAllOrders(
                authentication
        );
    }

    // =====================================================
    // GET ORDER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public Order getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        return orderService.getOrderById(
                id,
                authentication
        );
    }

    // =====================================================
    // UPDATE ORDER
    // =====================================================

    @PutMapping("/{id}")
    public Order updateOrder(
            @PathVariable Long id,
            @RequestBody Order order) {

        return orderService.updateOrder(
                id,
                order
        );
    }

    // =====================================================
    // DELETE ORDER
    // =====================================================

    @DeleteMapping("/{id}")
    public String deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return "Xóa đơn hàng thành công";
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @PatchMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Order order) {

        return orderService.updateOrderStatus(
                id,
                order.getStatus()
        );
    }

    @PatchMapping("/{id}/cancel")
    public Order cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return orderService.cancelOrder(
                id,
                authentication
        );
    }
    // =====================================================
// UPDATE SHIPPING INFORMATION
// =====================================================

    @PutMapping("/{id}/shipping")
    public Order updateShippingInformation(
            @PathVariable Long id,
            @RequestBody UpdateShippingRequest request,
            Authentication authentication) {

        return orderService.updateShippingInformation(
                id,
                request,
                authentication
        );
    }
}