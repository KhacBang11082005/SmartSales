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
                // Không tạo corsConfigurationSource() ở đây
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
                                // Trang quản lý sản phẩm được xem cả ACTIVE và INACTIVE
                                .requestMatchers(HttpMethod.GET, "/api/products/manage/**")
                                .hasAnyRole("ADMIN", "EMPLOYEE")

                                // Khách hàng được xem sản phẩm đang bán
                                .requestMatchers(HttpMethod.GET, "/api/products/**")
                                .permitAll()

                                // ADMIN + EMPLOYEE
                                // Thêm sản phẩm
                                .requestMatchers(HttpMethod.POST, "/api/products/**")
                                .hasAnyRole("ADMIN", "EMPLOYEE")

                                // ADMIN + EMPLOYEE
                                // Sửa sản phẩm
                                .requestMatchers(HttpMethod.PUT, "/api/products/**")
                                .hasAnyRole("ADMIN", "EMPLOYEE")

                                // Chỉ ADMIN
                                // Xóa sản phẩm
                                .requestMatchers(HttpMethod.DELETE, "/api/products/**")
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


                            // =================================================
                            // CUSTOMERS - CUSTOMER XEM THÔNG TIN CÁ NHÂN
                            // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/customers/me"
                                )
                                .hasRole("CUSTOMER")


                            // =================================================
                            // CUSTOMERS - CUSTOMER CẬP NHẬT THÔNG TIN CÁ NHÂN
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
                        //
                        // Phải đặt TRƯỚC /api/orders/**
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