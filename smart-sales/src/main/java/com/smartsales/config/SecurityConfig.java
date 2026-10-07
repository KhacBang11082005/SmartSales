package com.smartsales.config;

import com.smartsales.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(
                JwtAuthenticationFilter jwtAuthenticationFilter) {

                this.jwtAuthenticationFilter =
                        jwtAuthenticationFilter;
        }


        // =====================================================
        // PASSWORD ENCODER
        // =====================================================

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }


        // =====================================================
        // SECURITY CONFIGURATION
        // =====================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                HttpSecurity http) throws Exception {

                http

                        // =================================================
                        // CSRF
                        // =================================================

                        .csrf(csrf ->
                                csrf.disable()
                        )


                        // =================================================
                        // CORS
                        //
                        // CORS được cấu hình trong CorsConfig.java
                        // =================================================

                        .cors(cors -> {
                        })


                        // =================================================
                        // SESSION
                        // =================================================

                        .sessionManagement(session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                        )


                        // =================================================
                        // AUTHORIZATION
                        // =================================================

                        .authorizeHttpRequests(auth -> auth

                                // =================================================
                                // CORS PREFLIGHT
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()


                                // =================================================
                                // AUTH
                                // =================================================

                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()


                                // =================================================
                                // USERS
                                // =================================================

                                .requestMatchers(
                                        "/api/users/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // ROLES
                                // =================================================

                                .requestMatchers(
                                        "/api/roles/**"
                                )
                                .hasRole("ADMIN")


                                // =========================================================
                                // PRODUCT
                                // =========================================================

                                // ADMIN + EMPLOYEE
                                // Trang quản lý sản phẩm
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/products/manage/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // CUSTOMER / PUBLIC
                                // Xem sản phẩm đang bán
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/products/**"
                                )
                                .permitAll()


                                // ADMIN + EMPLOYEE
                                // Thêm sản phẩm
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/products/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // ADMIN + EMPLOYEE
                                // Sửa sản phẩm
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/products/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // ADMIN
                                // Xóa sản phẩm
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/products/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // CATEGORIES
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/categories/**"
                                )
                                .permitAll()

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/categories/**"
                                )
                                .hasRole("ADMIN")

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/categories/**"
                                )
                                .hasRole("ADMIN")

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/categories/**"
                                )
                                .hasRole("ADMIN")


                                // =========================================================
                                // KHUYẾN MẠI / PROMOTIONS
                                // =========================================================

                                // CUSTOMER - kiểm tra mã khuyến mại
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/promotions/validate"
                                )
                                .hasRole("CUSTOMER")


                                // ADMIN - xem khuyến mại
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/promotions"
                                )
                                .hasRole("ADMIN")


                                // ADMIN - thêm khuyến mại
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/promotions"
                                )
                                .hasRole("ADMIN")


                                // ADMIN - sửa khuyến mại
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/promotions/**"
                                )
                                .hasRole("ADMIN")


                                // ADMIN - xóa khuyến mại
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/promotions/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // CUSTOMERS - CUSTOMER XEM THÔNG TIN CÁ NHÂN
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/customers/me"
                                )
                                .hasRole("CUSTOMER")


                                // =================================================
                                // CUSTOMERS - CUSTOMER CẬP NHẬT THÔNG TIN
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/customers/me"
                                )
                                .hasRole("CUSTOMER")


                                // =================================================
                                // CUSTOMERS - ADMIN / EMPLOYEE
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/customers/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/customers/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =================================================
                                // CUSTOMER - ĐỔI MẬT KHẨU
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/customers/me/password"
                                )
                                .hasRole("CUSTOMER")


                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/customers/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/customers/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // ORDERS - GET
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/orders/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE",
                                        "CUSTOMER"
                                )


                                // =================================================
                                // ORDERS - CREATE
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/orders/**"
                                )
                                .hasRole("CUSTOMER")


                                // =================================================
                                // CUSTOMER CANCEL ORDER
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/orders/*/cancel"
                                )
                                .hasRole("CUSTOMER")


                                // =================================================
                                // ADMIN / EMPLOYEE UPDATE STATUS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/orders/*/status"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =================================================
                                // CUSTOMER UPDATE SHIPPING
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/orders/*/shipping"
                                )
                                .hasRole("CUSTOMER")


                                // =================================================
                                // ORDERS - PUT
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/orders/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =================================================
                                // ORDERS - DELETE
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/orders/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // ORDER DETAILS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/order-details/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE",
                                        "CUSTOMER"
                                )

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/order-details/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/order-details/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/order-details/**"
                                )
                                .hasRole("ADMIN")


                                // =================================================
                                // STATISTICS - TOP SẢN PHẨM BÁN CHẠY
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/statistics/top-products"
                                )
                                .permitAll()


                                // =================================================
                                // STATISTICS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/statistics/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =================================================
                                // ẢNH SẢN PHẨM
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/uploads/**"
                                )
                                .permitAll()


                                // =================================================
                                // UPLOAD ẢNH SẢN PHẨM
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/upload/product-image"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =================================================
                                // UPLOAD NHIỀU ẢNH SẢN PHẨM
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/upload/product-images"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "EMPLOYEE"
                                )


                                // =========================================================
                                // PRODUCT REVIEWS
                                // =========================================================

                                // ---------------------------------------------------------
                                // PUBLIC - XEM DANH SÁCH REVIEW
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/reviews/product/*"
                                )
                                .permitAll()


                                // ---------------------------------------------------------
                                // PUBLIC - XEM TỔNG QUAN REVIEW
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/reviews/product/*/summary"
                                )
                                .permitAll()


                                // ---------------------------------------------------------
                                // PUBLIC - XEM PHÂN BỐ SỐ SAO
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/reviews/product/*/rating-distribution"
                                )
                                .permitAll()


                                // ---------------------------------------------------------
                                // CUSTOMER - KIỂM TRA CÓ ĐƯỢC ĐÁNH GIÁ KHÔNG
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/reviews/product/*/can-review"
                                )
                                .hasRole("CUSTOMER")


                                // ---------------------------------------------------------
                                // CUSTOMER - LẤY REVIEW CỦA CHÍNH MÌNH
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/reviews/product/*/my-review"
                                )
                                .hasRole("CUSTOMER")


                                // ---------------------------------------------------------
                                // CUSTOMER - TẠO REVIEW
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/reviews/product/**"
                                )
                                .hasRole("CUSTOMER")


                                // ---------------------------------------------------------
                                // CUSTOMER - SỬA REVIEW
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/reviews/product/**"
                                )
                                .hasRole("CUSTOMER")


                                // ---------------------------------------------------------
                                // CUSTOMER - UPLOAD ẢNH / VIDEO
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/reviews/*/media"
                                )
                                .hasRole("CUSTOMER")


                                // ---------------------------------------------------------
                                // CUSTOMER - XÓA ẢNH / VIDEO
                                // ---------------------------------------------------------

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/reviews/media/**"
                                )
                                .hasRole("CUSTOMER")
// =================================================
// CHAT - CUSTOMER
// =================================================

// CUSTOMER - tạo cuộc trò chuyện
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/chat/conversations"
                                        )
                                        .hasRole("CUSTOMER")

// CUSTOMER - lấy cuộc trò chuyện hiện tại
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/chat/conversations/current"
                                        )
                                        .hasRole("CUSTOMER")

// CUSTOMER - lịch sử cuộc trò chuyện
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/chat/conversations/my"
                                        )
                                        .hasRole("CUSTOMER")


// =================================================
// CHAT - CUSTOMER / EMPLOYEE
// =================================================

// Lấy tin nhắn
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/chat/conversations/*/messages"
                                        )
                                        .hasAnyRole(
                                                "CUSTOMER",
                                                "EMPLOYEE"
                                        )

// Gửi tin nhắn
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/chat/conversations/*/messages"
                                        )
                                        .hasAnyRole(
                                                "CUSTOMER",
                                                "EMPLOYEE"
                                        )

// Đóng cuộc trò chuyện
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/chat/conversations/*/close"
                                        )
                                        .hasAnyRole(
                                                "CUSTOMER",
                                                "EMPLOYEE"
                                        )


// =================================================
// CHAT - EMPLOYEE
// =================================================

// Inbox CSKH
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/chat/staff/inbox"
                                        )
                                        .hasRole("EMPLOYEE")

// Xem cuộc trò chuyện
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/chat/staff/conversations/*"
                                        )
                                        .hasRole("EMPLOYEE")

// Tiếp nhận cuộc trò chuyện
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/chat/staff/conversations/*/accept"
                                        )
                                        .hasRole("EMPLOYEE")

// Heartbeat online
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/chat/staff/presence"
                                        )
                                        .hasRole("EMPLOYEE")

                                // =================================================
                                // OTHER
                                // =================================================

                                .anyRequest()
                                .authenticated()
                        )


                        // =================================================
                        // JWT FILTER
                        // =================================================

                        .addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class
                        );


                return http.build();
        }
}