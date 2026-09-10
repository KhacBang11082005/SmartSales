package com.smartsales.service;

import com.smartsales.dto.ChangePasswordRequest;
import com.smartsales.dto.CustomerAdminResponse;
import com.smartsales.dto.CustomerAdminUpdateRequest;
import com.smartsales.dto.CustomerOrderSummaryResponse;
import com.smartsales.dto.CustomerProfileResponse;
import com.smartsales.entity.Customer;
import com.smartsales.entity.User;
import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.OrderRepository;
import com.smartsales.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final OrderRepository orderRepository;


    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.customerRepository =
                customerRepository;

        this.userRepository =
                userRepository;

        this.orderRepository =
                orderRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    // =========================================================
    // LẤY TẤT CẢ CUSTOMER
    // =========================================================

    public List<CustomerAdminResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::convertToAdminResponse)
                .toList();
    }


    // =========================================================
    // LẤY CUSTOMER THEO ID
    // Bao gồm lịch sử mua hàng
    // =========================================================

    public CustomerAdminResponse getCustomerById(
            Long id
    ) {

        Customer customer =
                customerRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy Customer với ID: "
                                                + id
                                )
                        );


        CustomerAdminResponse response =
                convertToAdminResponse(
                        customer
                );


        // =====================================================
        // LẤY LỊCH SỬ ĐƠN HÀNG
        // =====================================================

        List<CustomerOrderSummaryResponse> orders =
                orderRepository
                        .findByCustomerId(id)
                        .stream()
                        .map(order -> {

                            int productQuantity = 0;


                            if (
                                    order.getOrderDetails() != null
                            ) {

                                productQuantity =
                                        order.getOrderDetails()
                                                .stream()
                                                .mapToInt(detail ->
                                                        detail.getQuantity() != null
                                                                ? detail.getQuantity()
                                                                : 0
                                                )
                                                .sum();
                            }


                            return new CustomerOrderSummaryResponse(

                                    order.getId(),

                                    order.getOrderDate(),

                                    productQuantity,

                                    order.getTotalAmount(),

                                    order.getStatus() != null
                                            ? order.getStatus().name()
                                            : null

                            );

                        })
                        .toList();


        response.setOrders(
                orders
        );


        return response;
    }


    // =========================================================
    // LẤY PROFILE CUSTOMER ĐANG ĐĂNG NHẬP
    // =========================================================

    public CustomerProfileResponse getMyProfile(
            Long userId
    ) {

        User user =
                getUserById(
                        userId
                );


        Customer customer =
                customerRepository
                        .findByUserId(userId)
                        .orElse(null);


        Long customerId = null;

        String phone = "";

        String address = "";


        if (customer != null) {

            customerId =
                    customer.getId();


            phone =
                    customer.getPhone() != null
                            ? customer.getPhone()
                            : "";


            address =
                    customer.getAddress() != null
                            ? customer.getAddress()
                            : "";
        }


        return new CustomerProfileResponse(

                user.getId(),

                customerId,

                user.getUsername(),

                user.getEmail(),

                user.getFullName(),

                phone,

                address,

                user.getRole() != null
                        ? user.getRole().getName()
                        : null,

                user.getStatus() != null
                        ? user.getStatus().name()
                        : null,

                user.getCreatedAt()
        );
    }


    // =========================================================
    // CẬP NHẬT PROFILE CUSTOMER
    // =========================================================

    public CustomerProfileResponse updateMyProfile(
            Long userId,
            CustomerProfileResponse request
    ) {

        User user =
                getUserById(
                        userId
                );


        // =====================================================
        // VALIDATE FULL NAME
        // =====================================================

        if (
                request.getFullName() == null ||
                        request.getFullName()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Họ và tên không được để trống."
            );
        }


        // =====================================================
        // UPDATE USER
        // =====================================================

        user.setFullName(
                request.getFullName()
                        .trim()
        );


        userRepository.save(
                user
        );


        // =====================================================
        // TÌM CUSTOMER
        // =====================================================

        Customer customer =
                customerRepository
                        .findByUserId(userId)
                        .orElse(null);


        // =====================================================
        // NẾU CHƯA CÓ CUSTOMER
        // =====================================================

        if (customer == null) {

            customer =
                    new Customer();

            customer.setUser(
                    user
            );
        }


        // =====================================================
        // UPDATE PHONE
        // =====================================================

        customer.setPhone(

                request.getPhone() != null
                        ? request.getPhone().trim()
                        : ""
        );


        // =====================================================
        // UPDATE ADDRESS
        //
        // Lưu ý:
        // Đây là PROFILE CỦA KHÁCH HÀNG,
        // KHÔNG phải form Admin chỉnh sửa.
        // Vì vậy vẫn giữ address ở đây.
        // =====================================================

        customer.setAddress(

                request.getAddress() != null
                        ? request.getAddress().trim()
                        : ""
        );


        customerRepository.save(
                customer
        );


        // =====================================================
        // RETURN PROFILE MỚI
        // =====================================================

        return getMyProfile(
                userId
        );
    }


    // =========================================================
    // ĐỔI MẬT KHẨU
    // =========================================================

    public void changeMyPassword(
            Long userId,
            ChangePasswordRequest request
    ) {

        User user =
                getUserById(
                        userId
                );


        // =====================================================
        // VALIDATE REQUEST
        // =====================================================

        if (
                request.getCurrentPassword() == null ||
                        request.getCurrentPassword()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Vui lòng nhập mật khẩu hiện tại."
            );
        }


        if (
                request.getNewPassword() == null ||
                        request.getNewPassword()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Vui lòng nhập mật khẩu mới."
            );
        }


        if (
                request.getConfirmPassword() == null ||
                        request.getConfirmPassword()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Vui lòng xác nhận mật khẩu mới."
            );
        }


        // =====================================================
        // KIỂM TRA MẬT KHẨU MỚI
        // =====================================================

        if (
                request.getNewPassword()
                        .length() < 6
        ) {

            throw new RuntimeException(
                    "Mật khẩu mới phải có ít nhất 6 ký tự."
            );
        }


        // =====================================================
        // KIỂM TRA CONFIRM PASSWORD
        // =====================================================

        if (
                !request.getNewPassword()
                        .equals(
                                request.getConfirmPassword()
                        )
        ) {

            throw new RuntimeException(
                    "Mật khẩu xác nhận không khớp."
            );
        }


        // =====================================================
        // KIỂM TRA MẬT KHẨU HIỆN TẠI
        // =====================================================

        if (
                !passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Mật khẩu hiện tại không đúng."
            );
        }


        // =====================================================
        // KHÔNG CHO ĐẶT LẠI MẬT KHẨU CŨ
        // =====================================================

        if (
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Mật khẩu mới không được trùng mật khẩu hiện tại."
            );
        }


        // =====================================================
        // UPDATE PASSWORD
        // =====================================================

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );


        userRepository.save(
                user
        );
    }


    // =========================================================
    // HELPER - LẤY USER
    // =========================================================

    private User getUserById(
            Long userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy tài khoản."
                        )
                );
    }


    // =========================================================
    // ADMIN - TẠO CUSTOMER
    // =========================================================

    public Customer createCustomer(
            Customer customer
    ) {

        return customerRepository.save(
                customer
        );
    }


    // =========================================================
    // ADMIN - CẬP NHẬT CUSTOMER
    //
    // Chỉ cập nhật:
    // - Họ tên
    // - Số điện thoại
    // - Trạng thái
    //
    // KHÔNG cập nhật địa chỉ
    // =========================================================

    @Transactional
    public CustomerAdminResponse updateCustomer(
            Long id,
            CustomerAdminUpdateRequest request
    ) {

        // =====================================================
        // TÌM CUSTOMER
        // =====================================================

        Customer existingCustomer =
                customerRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy Customer với ID: "
                                                + id
                                )
                        );


        // =====================================================
        // LẤY USER
        // =====================================================

        User user =
                existingCustomer.getUser();


        if (user == null) {

            throw new RuntimeException(
                    "Khách hàng chưa được liên kết với tài khoản."
            );
        }


        // =====================================================
        // VALIDATE FULL NAME
        // =====================================================

        if (
                request.getFullName() == null ||
                        request.getFullName()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Họ và tên không được để trống."
            );
        }


        // =====================================================
        // VALIDATE STATUS
        // =====================================================

        if (
                request.getStatus() == null ||
                        request.getStatus()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Trạng thái không được để trống."
            );
        }


        String status =
                request.getStatus()
                        .trim()
                        .toUpperCase();


        try {

            User.Status.valueOf(
                    status
            );

        } catch (
                IllegalArgumentException ex
        ) {

            throw new RuntimeException(
                    "Trạng thái không hợp lệ. " +
                            "Chỉ chấp nhận ACTIVE, INACTIVE hoặc LOCKED."
            );
        }


        // =====================================================
        // UPDATE FULL NAME
        // =====================================================

        user.setFullName(
                request.getFullName()
                        .trim()
        );


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        user.setStatus(
                User.Status.valueOf(
                        status
                )
        );


        // =====================================================
        // UPDATE PHONE
        // =====================================================

        existingCustomer.setPhone(

                request.getPhone() != null
                        ? request.getPhone()
                        .trim()
                        : ""
        );


        // =====================================================
        // SAVE USER
        // =====================================================

        userRepository.save(
                user
        );


        // =====================================================
        // SAVE CUSTOMER
        // =====================================================

        Customer savedCustomer =
                customerRepository.save(
                        existingCustomer
                );


        // =====================================================
        // TRẢ VỀ RESPONSE MỚI
        // =====================================================

        return convertToAdminResponse(
                savedCustomer
        );
    }


    // =========================================================
    // ADMIN - XÓA CUSTOMER
    // =========================================================

    public void deleteCustomer(
            Long id
    ) {

        Customer customer =
                customerRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy Customer với ID: "
                                                + id
                                )
                        );


        customerRepository.delete(
                customer
        );
    }


    // =========================================================
    // CONVERT CUSTOMER -> ADMIN RESPONSE
    //
    // KHÔNG có address
    // =========================================================

    private CustomerAdminResponse convertToAdminResponse(
            Customer customer
    ) {

        User user =
                customer.getUser();


        return new CustomerAdminResponse(

                // Customer ID
                customer.getId(),

                // User ID
                user != null
                        ? user.getId()
                        : null,

                // Username
                user != null
                        ? user.getUsername()
                        : "",

                // Email
                user != null
                        ? user.getEmail()
                        : "",

                // Full name
                user != null
                        ? user.getFullName()
                        : "",

                // Phone
                customer.getPhone() != null
                        ? customer.getPhone()
                        : "",

                // Role
                user != null &&
                        user.getRole() != null
                        ? user.getRole().getName()
                        : "",

                // Status
                user != null &&
                        user.getStatus() != null
                        ? user.getStatus().name()
                        : "",

                // Created date
                customer.getCreatedAt()
        );
    }
}