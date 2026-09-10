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
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // =========================================================
        // 1. Lấy JWT từ header Authorization
        // =========================================================

        String authHeader = request.getHeader("Authorization");

        // Nếu request không có JWT thì cho đi tiếp.
        // Spring Security sẽ tự quyết định request đó có được phép
        // truy cập hay không.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ phần "Bearer " để lấy token thật.
        String token = authHeader.substring(7);

        try {

            // =========================================================
            // 2. Kiểm tra JWT
            // =========================================================

            if (!jwtService.isTokenValid(token)) {

                // Token hết hạn hoặc không hợp lệ.
                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            // =========================================================
            // 3. Lấy thông tin định danh từ JWT
            // =========================================================

            String usernameOrEmail =
                    jwtService.extractUsername(token);

            // Nếu SecurityContext chưa có user thì mới xác thực.
            if (usernameOrEmail != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                // =====================================================
                // 4. TÌM USER
                //
                // Hệ thống mới đăng nhập bằng EMAIL.
                //
                // Tuy nhiên dữ liệu cũ có thể vẫn dùng username.
                // Vì vậy thử:
                //
                //    username → email
                //
                // để đảm bảo cả dữ liệu cũ và mới đều hoạt động.
                // =====================================================

                User user = userRepository
                        .findByUsername(usernameOrEmail)
                        .orElseGet(() ->
                                userRepository
                                        .findByEmail(usernameOrEmail)
                                        .orElse(null)
                        );

                // =====================================================
                // 5. Kiểm tra user và role
                // =====================================================

                if (user != null
                        && user.getRole() != null
                        && user.getRole().getName() != null) {

                    // Chuẩn hóa role về chữ hoa.
                    //
                    // Ví dụ:
                    // admin    → ADMIN
                    // Admin    → ADMIN
                    // ADMIN    → ADMIN
                    //
                    // Điều này rất quan trọng vì SecurityConfig
                    // đang sử dụng hasRole("ADMIN").
                    String roleName = user.getRole()
                            .getName()
                            .trim()
                            .toUpperCase(Locale.ROOT);

                    // Spring Security:
                    //
                    // hasRole("ADMIN")
                    //
                    // tương đương yêu cầu:
                    //
                    // ROLE_ADMIN
                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(
                                    "ROLE_" + roleName
                            );

                    // =================================================
                    // 6. Tạo Authentication
                    // =================================================

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    // Đưa user + quyền vào SecurityContext.
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception e) {

            // =========================================================
            // JWT lỗi → xóa authentication
            // =========================================================

            SecurityContextHolder.clearContext();

            // Không throw lỗi ở đây.
            // Cho request tiếp tục để Spring Security xử lý.
        }

        // =========================================================
        // 7. Cho request đi tiếp
        // =========================================================

        filterChain.doFilter(request, response);
    }
}