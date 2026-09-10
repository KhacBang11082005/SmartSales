package com.smartsales.controller;

import com.smartsales.dto.ChangePasswordRequest;
import com.smartsales.dto.CustomerAdminResponse;
import com.smartsales.dto.CustomerAdminUpdateRequest;
import com.smartsales.dto.CustomerProfileResponse;
import com.smartsales.entity.Customer;
import com.smartsales.entity.User;
import com.smartsales.service.CustomerService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(
            CustomerService customerService
    ) {
        this.customerService = customerService;
    }

    // =========================================================
    // LẤY THÔNG TIN TÀI KHOẢN CUSTOMER ĐANG ĐĂNG NHẬP
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<CustomerProfileResponse> getMyProfile(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        CustomerProfileResponse profile =
                customerService.getMyProfile(user.getId());

        return ResponseEntity.ok(profile);
    }

    // =========================================================
    // CẬP NHẬT THÔNG TIN TÀI KHOẢN CUSTOMER
    // =========================================================

    @PutMapping("/me")
    public ResponseEntity<CustomerProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody CustomerProfileResponse request
    ) {

        User user = (User) authentication.getPrincipal();

        CustomerProfileResponse updatedProfile =
                customerService.updateMyProfile(
                        user.getId(),
                        request
                );

        return ResponseEntity.ok(updatedProfile);
    }

    // =========================================================
    // ĐỔI MẬT KHẨU
    // =========================================================

    @PutMapping("/me/password")
    public ResponseEntity<?> changeMyPassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        customerService.changeMyPassword(
                user.getId(),
                request
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "Đổi mật khẩu thành công."
                )
        );
    }

    // =========================================================
    // ADMIN / EMPLOYEE - LẤY DANH SÁCH CUSTOMER
    // =========================================================

    @GetMapping
    public List<CustomerAdminResponse> getAllCustomers() {

        return customerService.getAllCustomers();
    }

    // =========================================================
    // ADMIN / EMPLOYEE - LẤY CUSTOMER THEO ID
    // =========================================================

    @GetMapping("/{id}")
    public CustomerAdminResponse getCustomerById(
            @PathVariable Long id
    ) {

        return customerService.getCustomerById(id);
    }

    // =========================================================
    // ADMIN / EMPLOYEE - TẠO CUSTOMER
    // =========================================================

    @PostMapping
    public Customer createCustomer(
            @RequestBody Customer customer
    ) {

        return customerService.createCustomer(customer);
    }

    // =========================================================
    // ADMIN / EMPLOYEE - CẬP NHẬT CUSTOMER
    // Không cập nhật địa chỉ
    // Có thể cập nhật: họ tên, số điện thoại, trạng thái
    // =========================================================

    @PutMapping("/{id}")
    public CustomerAdminResponse updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerAdminUpdateRequest request
    ) {

        return customerService.updateCustomer(
                id,
                request
        );
    }

    // =========================================================
    // ADMIN - XÓA CUSTOMER
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(
            @PathVariable Long id
    ) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok(
                new MessageResponse(
                        "Xóa khách hàng thành công."
                )
        );
    }

    // =========================================================
    // RESPONSE MESSAGE
    // =========================================================

    public static class MessageResponse {

        private String message;

        public MessageResponse(
                String message
        ) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(
                String message
        ) {
            this.message = message;
        }
    }
}