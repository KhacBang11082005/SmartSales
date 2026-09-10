package com.smartsales.service;

import com.smartsales.entity.Order;
import com.smartsales.entity.OrderDetail;
import com.smartsales.entity.Product;
import com.smartsales.repository.OrderDetailRepository;
import com.smartsales.repository.OrderRepository;
import com.smartsales.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderDetailService(
            OrderDetailRepository orderDetailRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderDetailRepository = orderDetailRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // CREATE
    public OrderDetail createOrderDetail(OrderDetail orderDetail) {

        // 1. Kiểm tra số lượng
        if (orderDetail.getQuantity() == null ||
                orderDetail.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Số lượng sản phẩm phải lớn hơn 0"
            );
        }

        // 2. Kiểm tra Order có tồn tại không
        orderRepository.findById(
                orderDetail.getOrder().getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Không tìm thấy đơn hàng với id: "
                                + orderDetail.getOrder().getId()
                )
        );

        // 3. Kiểm tra Product có tồn tại không
        Product product = productRepository.findById(
                orderDetail.getProduct().getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Không tìm thấy sản phẩm với id: "
                                + orderDetail.getProduct().getId()
                )
        );

        // 4. Kiểm tra Product có đang ACTIVE không
        if (product.getStatus() != Product.Status.ACTIVE) {

            throw new RuntimeException(
                    "Sản phẩm hiện không hoạt động"
            );
        }

        // 5. Kiểm tra tồn kho
        if (product.getQuantity() < orderDetail.getQuantity()) {

            throw new RuntimeException(
                    "Sản phẩm không đủ số lượng trong kho. " +
                            "Tồn kho: " + product.getQuantity() +
                            ", yêu cầu: " + orderDetail.getQuantity()
            );
        }

        // 6. Trừ số lượng tồn kho
        product.setQuantity(
                product.getQuantity() - orderDetail.getQuantity()
        );

        productRepository.save(product);

        // 5. Lấy giá từ Product trong database
        BigDecimal unitPrice = product.getPrice();

        // 6. Gán giá cho OrderDetail
        orderDetail.setUnitPrice(unitPrice);

        // 7. Tính subtotal
        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                orderDetail.getQuantity()
                        )
                );

        orderDetail.setSubtotal(subtotal);

        // 8. Lưu OrderDetail
        OrderDetail savedOrderDetail =
                orderDetailRepository.save(orderDetail);

        // 9. Cập nhật tổng tiền Order
        updateOrderTotal(
                orderDetail.getOrder().getId()
        );

        return savedOrderDetail;
    }
    // READ ALL
    public List<OrderDetail> getAllOrderDetails() {

        return orderDetailRepository.findAll();
    }

    // READ BY ID
    public OrderDetail getOrderDetailById(Long id) {

        return orderDetailRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy chi tiết đơn hàng với id: " + id
                        )
                );
    }
    // READ BY ORDER ID
    public List<OrderDetail> getOrderDetailsByOrderId(Long orderId) {

        return orderDetailRepository.findByOrderId(orderId);
    }

    // UPDATE
    @Transactional
    public OrderDetail updateOrderDetail(
            Long id,
            OrderDetail orderDetail) {

        // 1. Tìm OrderDetail hiện tại
        OrderDetail existingOrderDetail =
                orderDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy chi tiết đơn hàng với id: " + id
                                )
                        );

        // 2. Kiểm tra quantity mới
        if (orderDetail.getQuantity() == null ||
                orderDetail.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Số lượng sản phẩm phải lớn hơn 0"
            );
        }

        // 3. Lưu ID Order cũ TRƯỚC khi thay đổi
        Long oldOrderId =
                existingOrderDetail.getOrder().getId();

        // 4. Lấy Order mới
        Order order = orderRepository.findById(
                orderDetail.getOrder().getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Không tìm thấy đơn hàng với id: "
                                + orderDetail.getOrder().getId()
                )
        );

        // 5. Lấy Product mới
        Product newProduct = productRepository.findById(
                orderDetail.getProduct().getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Không tìm thấy sản phẩm với id: "
                                + orderDetail.getProduct().getId()
                )
        );

        // 6. Kiểm tra Product ACTIVE
        if (newProduct.getStatus() != Product.Status.ACTIVE) {

            throw new RuntimeException(
                    "Sản phẩm hiện không hoạt động"
            );
        }

        // 7. Product cũ
        Product oldProduct =
                existingOrderDetail.getProduct();

        // 8. Quantity cũ và mới
        int oldQuantity =
                existingOrderDetail.getQuantity();

        int newQuantity =
                orderDetail.getQuantity();

        // ==================================================
        // KHÔNG ĐỔI PRODUCT
        // ==================================================

        if (oldProduct.getId().equals(newProduct.getId())) {

            int difference =
                    newQuantity - oldQuantity;

            // Tăng số lượng
            if (difference > 0) {

                if (newProduct.getQuantity() < difference) {

                    throw new RuntimeException(
                            "Sản phẩm không đủ số lượng trong kho. " +
                                    "Tồn kho: " + newProduct.getQuantity() +
                                    ", cần thêm: " + difference
                    );
                }

                newProduct.setQuantity(
                        newProduct.getQuantity() - difference
                );
            }

            // Giảm số lượng
            else if (difference < 0) {

                newProduct.setQuantity(
                        newProduct.getQuantity() + Math.abs(difference)
                );
            }

            productRepository.save(newProduct);
        }

        // ==================================================
        // ĐỔI PRODUCT
        // ==================================================

        else {

            // Trả Product cũ về kho
            oldProduct.setQuantity(
                    oldProduct.getQuantity() + oldQuantity
            );

            productRepository.save(oldProduct);

            // Kiểm tra Product mới
            if (newProduct.getQuantity() < newQuantity) {

                throw new RuntimeException(
                        "Sản phẩm mới không đủ số lượng trong kho. " +
                                "Tồn kho: " + newProduct.getQuantity() +
                                ", yêu cầu: " + newQuantity
                );
            }

            // Trừ Product mới
            newProduct.setQuantity(
                    newProduct.getQuantity() - newQuantity
            );

            productRepository.save(newProduct);
        }

        // 9. Lấy giá từ database
        BigDecimal unitPrice =
                newProduct.getPrice();

        // 10. Cập nhật OrderDetail
        existingOrderDetail.setOrder(order);
        existingOrderDetail.setProduct(newProduct);
        existingOrderDetail.setQuantity(newQuantity);
        existingOrderDetail.setUnitPrice(unitPrice);

        // 11. Tính subtotal
        BigDecimal subtotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(newQuantity)
                );

        existingOrderDetail.setSubtotal(subtotal);

        // 12. Lưu OrderDetail
        OrderDetail savedOrderDetail =
                orderDetailRepository.save(existingOrderDetail);

        // 13. Cập nhật tổng Order cũ
        updateOrderTotal(oldOrderId);

        // 14. Nếu chuyển sang Order khác
        if (!oldOrderId.equals(order.getId())) {
            updateOrderTotal(order.getId());
        }

        return savedOrderDetail;
    }

    // DELETE
    @Transactional
    public void deleteOrderDetail(Long id) {

        // 1. Tìm OrderDetail
        OrderDetail existingOrderDetail =
                orderDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy chi tiết đơn hàng với id: " + id
                                )
                        );

        // 2. Lấy Order ID
        Long orderId =
                existingOrderDetail.getOrder().getId();

        // 3. Lấy Product
        Product product =
                existingOrderDetail.getProduct();

        // 4. Lấy số lượng đang được sử dụng trong OrderDetail
        int quantity =
                existingOrderDetail.getQuantity();

        // 5. Trả số lượng về kho
        product.setQuantity(
                product.getQuantity() + quantity
        );

        productRepository.save(product);

        // 6. Xóa OrderDetail
        orderDetailRepository.delete(existingOrderDetail);

        // 7. Cập nhật lại tổng tiền Order
        updateOrderTotal(orderId);
    }

    // CẬP NHẬT TỔNG TIỀN ORDER
    private void updateOrderTotal(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy đơn hàng với id: " + orderId
                        )
                );

        List<OrderDetail> details =
                orderDetailRepository.findByOrderId(orderId);

        BigDecimal total = BigDecimal.ZERO;

        for (OrderDetail detail : details) {

            if (detail.getSubtotal() != null) {
                total = total.add(detail.getSubtotal());
            }
        }

        order.setTotalAmount(total);

        orderRepository.save(order);
    }
}