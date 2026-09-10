package com.smartsales.controller;

import com.smartsales.entity.OrderDetail;
import com.smartsales.service.OrderDetailService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-details")
public class OrderDetailController {

    private final OrderDetailService orderDetailService;

    public OrderDetailController(
            OrderDetailService orderDetailService) {

        this.orderDetailService = orderDetailService;
    }

    // CREATE
    @PostMapping
    public OrderDetail createOrderDetail(
            @RequestBody OrderDetail orderDetail) {

        return orderDetailService.createOrderDetail(orderDetail);
    }

    // READ ALL
    @GetMapping
    public List<OrderDetail> getAllOrderDetails() {

        return orderDetailService.getAllOrderDetails();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public OrderDetail getOrderDetailById(
            @PathVariable Long id) {

        return orderDetailService.getOrderDetailById(id);
    }

    // READ BY ORDER ID
    @GetMapping("/order/{orderId}")
    public List<OrderDetail> getOrderDetailsByOrderId(
            @PathVariable Long orderId) {

        return orderDetailService
                .getOrderDetailsByOrderId(orderId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public OrderDetail updateOrderDetail(
            @PathVariable Long id,
            @RequestBody OrderDetail orderDetail) {

        return orderDetailService
                .updateOrderDetail(id, orderDetail);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteOrderDetail(
            @PathVariable Long id) {

        orderDetailService.deleteOrderDetail(id);

        return "Xóa chi tiết đơn hàng thành công";
    }
}