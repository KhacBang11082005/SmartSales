package com.smartsales.service;

import com.smartsales.entity.Customer;
import com.smartsales.entity.Order;
import com.smartsales.entity.OrderDetail;
import com.smartsales.entity.Product;
import com.smartsales.entity.User;
import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.OrderDetailRepository;
import com.smartsales.repository.OrderRepository;
import com.smartsales.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.smartsales.dto.UpdateShippingRequest;

import com.smartsales.dto.CreateOrderRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository) {

        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }


    // =====================================================
    // CREATE ORDER
    // =====================================================

    @Transactional
    public Order createOrder(
            CreateOrderRequest request,
            Authentication authentication) {

        // =====================================================
        // KIỂM TRA REQUEST
        // =====================================================

        if (request == null ||
                request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Đơn hàng phải có ít nhất một sản phẩm"
            );
        }


        // =====================================================
        // LẤY USER ĐANG ĐĂNG NHẬP
        // =====================================================

        User currentUser =
                getCurrentUser(authentication);

        String role =
                currentUser.getRole().getName();


        // =====================================================
        // XÁC ĐỊNH CUSTOMER
        // =====================================================

        Customer customer;


        // CUSTOMER
        if ("CUSTOMER".equals(role)) {

            customer =
                    customerRepository
                            .findByUserId(currentUser.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy thông tin Customer"
                                    )
                            );
        }


        // ADMIN / EMPLOYEE
        else if ("ADMIN".equals(role) ||
                "EMPLOYEE".equals(role)) {

            throw new RuntimeException(
                    "API mua hàng này yêu cầu Customer đăng nhập"
            );
        }

        else {

            throw new RuntimeException(
                    "Role không được phép tạo đơn hàng"
            );
        }


        // =====================================================
        // TẠO ORDER
        // =====================================================

        Order order = new Order();

        order.setCustomer(customer);


// =====================================================
// SHIPPING INFORMATION
// =====================================================

        order.setShippingName(
                request.getShippingName()
        );

        order.setShippingPhone(
                request.getShippingPhone()
        );

        order.setShippingAddress(
                request.getShippingAddress()
        );

        order.setShippingNote(
                request.getShippingNote()
        );


        order.setStatus(
                Order.Status.PENDING
        );

        order.setOrderDate(
                LocalDateTime.now()
        );

        order.setTotalAmount(
                BigDecimal.ZERO
        );




        // Lưu Order trước
        order = orderRepository.save(order);


        // =====================================================
        // TÍNH TIỀN + TẠO ORDER DETAIL
        // =====================================================

        BigDecimal totalAmount =
                BigDecimal.ZERO;


        for (CreateOrderRequest.OrderItemRequest item :
                request.getItems()) {


            // -------------------------------------------------
            // VALIDATE PRODUCT ID
            // -------------------------------------------------

            if (item.getProductId() == null) {

                throw new RuntimeException(
                        "Product ID không được để trống"
                );
            }


            // -------------------------------------------------
            // VALIDATE QUANTITY
            // -------------------------------------------------

            if (item.getQuantity() == null ||
                    item.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Số lượng sản phẩm phải lớn hơn 0"
                );
            }


            // -------------------------------------------------
            // TÌM PRODUCT
            // -------------------------------------------------

            Product product =
                    productRepository
                            .findById(item.getProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy sản phẩm với id: "
                                                    + item.getProductId()
                                    )
                            );


            // -------------------------------------------------
            // KIỂM TRA PRODUCT ACTIVE
            // -------------------------------------------------

            if (product.getStatus() !=
                    Product.Status.ACTIVE) {

                throw new RuntimeException(
                        "Sản phẩm " +
                                product.getName() +
                                " hiện không kinh doanh"
                );
            }


            // -------------------------------------------------
            // KIỂM TRA TỒN KHO
            // -------------------------------------------------

            if (product.getQuantity() <
                    item.getQuantity()) {

                throw new RuntimeException(
                        "Sản phẩm " +
                                product.getName() +
                                " không đủ số lượng trong kho"
                );
            }


            // -------------------------------------------------
            // LẤY GIÁ TỪ DATABASE
            // -------------------------------------------------

            BigDecimal unitPrice =
                    product.getPrice();


            // -------------------------------------------------
            // TÍNH SUBTOTAL
            // -------------------------------------------------

            BigDecimal subtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()
                            )
                    );


            // -------------------------------------------------
            // TẠO ORDER DETAIL
            // -------------------------------------------------

            OrderDetail detail =
                    new OrderDetail();

            detail.setOrder(order);

            detail.setProduct(product);

            detail.setQuantity(
                    item.getQuantity()
            );

            detail.setUnitPrice(
                    unitPrice
            );

            detail.setSubtotal(
                    subtotal
            );


            orderDetailRepository.save(
                    detail
            );


            // -------------------------------------------------
            // TRỪ TỒN KHO
            // -------------------------------------------------

            product.setQuantity(
                    product.getQuantity()
                            - item.getQuantity()
            );

            productRepository.save(
                    product
            );


            // -------------------------------------------------
            // CỘNG TỔNG TIỀN
            // -------------------------------------------------

            totalAmount =
                    totalAmount.add(subtotal);
        }


        // =====================================================
        // CẬP NHẬT TOTAL AMOUNT
        // =====================================================

        order.setTotalAmount(
                totalAmount
        );


        return orderRepository.save(
                order
        );
    }


    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    public List<Order> getAllOrders(
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);

        String role =
                currentUser.getRole().getName();


        // =================================================
        // ADMIN / EMPLOYEE
        // =================================================

        if ("ADMIN".equals(role) ||
                "EMPLOYEE".equals(role)) {

            return orderRepository.findAll();
        }


        // =================================================
        // CUSTOMER
        // =================================================

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByUserId(currentUser.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy thông tin Customer"
                                    )
                            );

            return orderRepository
                    .findByCustomerId(
                            customer.getId()
                    );
        }


        throw new RuntimeException(
                "Role không được phép xem đơn hàng"
        );
    }


    // =====================================================
    // GET ORDER BY ID
    // =====================================================

    public Order getOrderById(
            Long id,
            Authentication authentication) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy đơn hàng với id: "
                                                + id
                                )
                        );


        User currentUser =
                getCurrentUser(authentication);

        String role =
                currentUser.getRole().getName();


        // =================================================
        // ADMIN / EMPLOYEE
        // =================================================

        if ("ADMIN".equals(role) ||
                "EMPLOYEE".equals(role)) {

            return order;
        }


        // =================================================
        // CUSTOMER
        // =================================================

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByUserId(currentUser.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy thông tin Customer"
                                    )
                            );

            if (!order.getCustomer()
                    .getId()
                    .equals(customer.getId())) {

                throw new RuntimeException(
                        "Bạn không có quyền xem đơn hàng này"
                );
            }

            return order;
        }


        throw new RuntimeException(
                "Bạn không có quyền xem đơn hàng"
        );
    }


    // =====================================================
    // UPDATE ORDER
    // =====================================================

    public Order updateOrder(
            Long id,
            Order order) {

        Order existingOrder =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy đơn hàng với id: "
                                                + id
                                )
                        );


        // Chỉ cập nhật Customer
        if (order.getCustomer() != null &&
                order.getCustomer().getId() != null) {

            Customer customer =
                    customerRepository
                            .findById(
                                    order.getCustomer().getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy khách hàng với id: "
                                                    + order.getCustomer().getId()
                                    )
                            );

            existingOrder.setCustomer(customer);
        }


        return orderRepository.save(
                existingOrder
        );
    }


    // =====================================================
    // DELETE ORDER
    // =====================================================

    public void deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {

            throw new RuntimeException(
                    "Không tìm thấy đơn hàng với id: "
                            + id
            );
        }

        orderRepository.deleteById(id);
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Transactional
    public Order updateOrderStatus(
            Long id,
            Order.Status newStatus) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy đơn hàng với id: "
                                                + id
                                )
                        );


        Order.Status currentStatus =
                order.getStatus();


        // =================================================
        // CHECK STATUS
        // =================================================

        if (newStatus == null) {

            throw new RuntimeException(
                    "Trạng thái mới không được để trống"
            );
        }


        // Không cho chuyển sang trạng thái hiện tại

        if (currentStatus == newStatus) {

            throw new RuntimeException(
                    "Đơn hàng đã ở trạng thái "
                            + currentStatus
            );
        }


        // =================================================
        // COMPLETED
        // =================================================

        if (currentStatus ==
                Order.Status.COMPLETED) {

            throw new RuntimeException(
                    "Đơn hàng đã hoàn thành, không thể thay đổi trạng thái"
            );
        }


        // =================================================
        // CANCELLED
        // =================================================

        if (currentStatus ==
                Order.Status.CANCELLED) {

            throw new RuntimeException(
                    "Đơn hàng đã hủy, không thể thay đổi trạng thái"
            );
        }


        // =================================================
        // PENDING
        // =================================================

        if (currentStatus ==
                Order.Status.PENDING) {

            if (newStatus !=
                    Order.Status.CONFIRMED &&
                    newStatus !=
                            Order.Status.CANCELLED) {

                throw new RuntimeException(
                        "Đơn hàng PENDING chỉ có thể chuyển sang CONFIRMED hoặc CANCELLED"
                );
            }
        }


        // =================================================
        // CONFIRMED
        // =================================================

        if (currentStatus ==
                Order.Status.CONFIRMED) {

            if (newStatus !=
                    Order.Status.PROCESSING &&
                    newStatus !=
                            Order.Status.CANCELLED) {

                throw new RuntimeException(
                        "Đơn hàng CONFIRMED chỉ có thể chuyển sang PROCESSING hoặc CANCELLED"
                );
            }
        }


        // =================================================
        // PROCESSING
        // =================================================

        if (currentStatus ==
                Order.Status.PROCESSING) {

            if (newStatus !=
                    Order.Status.COMPLETED) {

                throw new RuntimeException(
                        "Đơn hàng PROCESSING chỉ có thể chuyển sang COMPLETED"
                );
            }
        }


        // =================================================
        // CANCEL ORDER
        // =================================================

        if (newStatus ==
                Order.Status.CANCELLED) {

            restoreProductsToStock(
                    order.getId()
            );
        }


        order.setStatus(
                newStatus
        );


        return orderRepository.save(
                order
        );
    }
    // =====================================================
// CUSTOMER CANCEL ORDER
// =====================================================

    @Transactional
    public Order cancelOrder(
            Long orderId,
            Authentication authentication) {

        // =====================================================
        // LẤY USER ĐANG ĐĂNG NHẬP
        // =====================================================

        User currentUser =
                getCurrentUser(authentication);

        String role =
                currentUser.getRole().getName();


        // =====================================================
        // CHỈ CUSTOMER ĐƯỢC HỦY ĐƠN
        // =====================================================

        if (!"CUSTOMER".equals(role)) {

            throw new RuntimeException(
                    "Bạn không có quyền hủy đơn hàng"
            );
        }


        // =====================================================
        // TÌM ĐƠN HÀNG
        // =====================================================

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy đơn hàng với id: "
                                                + orderId
                                )
                        );


        // =====================================================
        // TÌM CUSTOMER HIỆN TẠI
        // =====================================================

        Customer customer =
                customerRepository
                        .findByUserId(currentUser.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy thông tin Customer"
                                )
                        );


        // =====================================================
        // KIỂM TRA ĐƠN CÓ THUỘC CUSTOMER NÀY KHÔNG
        // =====================================================

        if (!order.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "Bạn không có quyền hủy đơn hàng này"
            );
        }


        // =====================================================
        // CHỈ ĐƯỢC HỦY KHI ĐANG PENDING
        // =====================================================

        if (order.getStatus() != Order.Status.PENDING) {

            throw new RuntimeException(
                    "Chỉ có thể hủy đơn hàng đang chờ xác nhận"
            );
        }


        // =====================================================
        // HOÀN LẠI SỐ LƯỢNG VÀO KHO
        // =====================================================

        restoreProductsToStock(
                order.getId()
        );


        // =====================================================
        // CẬP NHẬT TRẠNG THÁI
        // =====================================================

        order.setStatus(
                Order.Status.CANCELLED
        );


        // =====================================================
        // LƯU ORDER
        // =====================================================

        return orderRepository.save(
                order
        );
    }

    // =====================================================
    // RESTORE PRODUCT STOCK
    // =====================================================

    private void restoreProductsToStock(
            Long orderId) {

        List<OrderDetail> orderDetails =
                orderDetailRepository
                        .findByOrderId(orderId);


        for (OrderDetail detail :
                orderDetails) {

            Product product =
                    detail.getProduct();


            product.setQuantity(
                    product.getQuantity()
                            + detail.getQuantity()
            );


            productRepository.save(
                    product
            );
        }
    }


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    private User getCurrentUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Bạn chưa đăng nhập"
            );
        }


        Object principal =
                authentication.getPrincipal();


        if (!(principal instanceof User)) {

            throw new RuntimeException(
                    "Không xác định được tài khoản đang đăng nhập"
            );
        }


        return (User) principal;
    }


    // =====================================================
// UPDATE SHIPPING INFORMATION
// =====================================================

    @Transactional
    public Order updateShippingInformation(
            Long id,
            UpdateShippingRequest request,
            Authentication authentication) {

        if (request == null) {
            throw new RuntimeException(
                    "Thông tin giao hàng không hợp lệ"
            );
        }


        // =====================================================
        // LẤY ORDER
        // =====================================================

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy đơn hàng với id: "
                                                + id
                                )
                        );


        // =====================================================
        // LẤY USER
        // =====================================================

        User currentUser =
                getCurrentUser(authentication);

        String role =
                currentUser.getRole().getName();


        // =====================================================
        // CUSTOMER
        // =====================================================

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByUserId(currentUser.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Không tìm thấy thông tin Customer"
                                    )
                            );


            if (!order.getCustomer()
                    .getId()
                    .equals(customer.getId())) {

                throw new RuntimeException(
                        "Bạn không có quyền chỉnh sửa đơn hàng này"
                );
            }
        }


        // =====================================================
        // CHỈ CHO SỬA KHI ĐƠN CHƯA XỬ LÝ
        // =====================================================

        if (order.getStatus() != Order.Status.PENDING) {

            throw new RuntimeException(
                    "Chỉ có thể chỉnh sửa thông tin giao hàng khi đơn hàng đang chờ xác nhận"
            );
        }


        // =====================================================
        // VALIDATE
        // =====================================================

        if (request.getShippingName() == null ||
                request.getShippingName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Họ tên giao hàng không được để trống"
            );
        }


        if (request.getShippingPhone() == null ||
                request.getShippingPhone().trim().isEmpty()) {

            throw new RuntimeException(
                    "Số điện thoại không được để trống"
            );
        }


        if (request.getShippingAddress() == null ||
                request.getShippingAddress().trim().isEmpty()) {

            throw new RuntimeException(
                    "Địa chỉ giao hàng không được để trống"
            );
        }


        // =====================================================
        // UPDATE
        // =====================================================

        order.setShippingName(
                request.getShippingName().trim()
        );

        order.setShippingPhone(
                request.getShippingPhone().trim()
        );

        order.setShippingAddress(
                request.getShippingAddress().trim()
        );

        order.setShippingNote(
                request.getShippingNote() == null
                        ? ""
                        : request.getShippingNote().trim()
        );


        return orderRepository.save(order);
    }
}