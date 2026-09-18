package com.smartsales.security;

import com.smartsales.entity.User;
import com.smartsales.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Locale;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final UserRepository userRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {

        this.jwtService = jwtService;

        this.userRepository = userRepository;
    }


    // =========================================================
    // JWT FILTER
    // =========================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        // =====================================================
        // 1. LẤY AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader("Authorization");


        // =====================================================
        // 2. KHÔNG CÓ TOKEN
        // =====================================================

        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =====================================================
        // 3. LẤY TOKEN
        // =====================================================

        String token =
                authHeader.substring(7);


        try {


            // =================================================
            // 4. KIỂM TRA TOKEN
            // =================================================

            if (
                    !jwtService.isTokenValid(token)
            ) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // 5. LẤY EMAIL / USERNAME TỪ JWT
            // =================================================

            String usernameOrEmail =
                    jwtService.extractUsername(token);


            // =================================================
            // 6. CHỈ XÁC THỰC KHI CHƯA CÓ AUTHENTICATION
            // =================================================

            if (
                    usernameOrEmail != null
                            &&
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                                    == null
            ) {


                // =================================================
                // 7. TÌM USER
                //
                // JWT hiện tại dùng EMAIL làm subject.
                //
                // Nhưng vẫn hỗ trợ username cũ.
                // =================================================

                User user =
                        userRepository
                                .findByEmail(
                                        usernameOrEmail
                                )
                                .orElseGet(() ->
                                        userRepository
                                                .findByUsername(
                                                        usernameOrEmail
                                                )
                                                .orElse(null)
                                );


                // =================================================
                // 8. KHÔNG TÌM THẤY USER
                // =================================================

                if (user == null) {

                    System.err.println(
                            "========== JWT ERROR =========="
                    );

                    System.err.println(
                            "Không tìm thấy User với email/username: "
                                    + usernameOrEmail
                    );

                    System.err.println(
                            "Request: "
                                    + request.getMethod()
                                    + " "
                                    + request.getRequestURI()
                    );

                    System.err.println(
                            "================================"
                    );

                    SecurityContextHolder.clearContext();

                    filterChain.doFilter(
                            request,
                            response
                    );

                    return;
                }


                // =================================================
                // 9. KIỂM TRA TÀI KHOẢN BỊ KHÓA
                // =================================================

                if (
                        user.getStatus()
                                == User.Status.LOCKED
                ) {

                    SecurityContextHolder.clearContext();

                    response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED
                    );

                    response.setContentType(
                            "application/json"
                    );

                    response.setCharacterEncoding(
                            "UTF-8"
                    );

                    response.getWriter().write(
                            """
                            {
                                "message": "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
                            }
                            """
                    );

                    return;
                }


                // =================================================
                // 10. KIỂM TRA ROLE
                // =================================================

                if (
                        user.getRole() == null
                                ||
                                user.getRole().getName() == null
                ) {

                    System.err.println(
                            "========== JWT ROLE ERROR =========="
                    );

                    System.err.println(
                            "User ID: "
                                    + user.getId()
                    );

                    System.err.println(
                            "Email: "
                                    + user.getEmail()
                    );

                    System.err.println(
                            "User không có Role."
                    );

                    System.err.println(
                            "===================================="
                    );

                    SecurityContextHolder.clearContext();

                    filterChain.doFilter(
                            request,
                            response
                    );

                    return;
                }


                // =================================================
                // 11. CHUẨN HÓA ROLE
                // =================================================

                String roleName =
                        user.getRole()
                                .getName()
                                .trim()
                                .toUpperCase(
                                        Locale.ROOT
                                );


                // =================================================
                // 12. TẠO AUTHORITY
                //
                // hasRole("CUSTOMER")
                //
                // yêu cầu:
                //
                // ROLE_CUSTOMER
                // =================================================

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                "ROLE_" + roleName
                        );


                // =================================================
                // 13. TẠO AUTHENTICATION
                // =================================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(
                                        authority
                                )
                        );


                // =================================================
                // 14. LƯU AUTHENTICATION
                // =================================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );


                // =================================================
                // 15. DEBUG
                //
                // Có thể nhìn Console Backend để xác nhận:
                //
                // CUSTOMER
                // ROLE_CUSTOMER
                // =================================================

                System.out.println(
                        "========== JWT AUTH =========="
                );

                System.out.println(
                        "User ID: "
                                + user.getId()
                );

                System.out.println(
                        "Email: "
                                + user.getEmail()
                );

                System.out.println(
                        "Role: "
                                + roleName
                );

                System.out.println(
                        "Authority: ROLE_"
                                + roleName
                );

                System.out.println(
                        "Request: "
                                + request.getMethod()
                                + " "
                                + request.getRequestURI()
                );

                System.out.println(
                        "=============================="
                );
            }


        } catch (Exception e) {


            // =====================================================
            // JWT CÓ LỖI
            // =====================================================

            SecurityContextHolder.clearContext();


            System.err.println(
                    "========== JWT AUTHENTICATION ERROR =========="
            );

            System.err.println(
                    "Request: "
                            + request.getMethod()
                            + " "
                            + request.getRequestURI()
            );

            System.err.println(
                    "Error type: "
                            + e.getClass().getName()
            );

            System.err.println(
                    "Message: "
                            + e.getMessage()
            );

            e.printStackTrace();

            System.err.println(
                    "==============================================="
            );
        }


        // =====================================================
        // 16. CHO REQUEST ĐI TIẾP
        // =====================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}