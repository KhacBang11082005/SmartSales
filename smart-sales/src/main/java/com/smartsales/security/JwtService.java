package com.smartsales.security;

import com.smartsales.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;

    public JwtService(
            @Value("${jwt.secret}") String secret) {

        // =========================================================
        // Tạo SecretKey dùng để ký và kiểm tra JWT
        // =========================================================

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =============================================================
    // TẠO JWT
    // =============================================================

    public String generateToken(User user) {

        Date now = new Date();

        // JWT có thời hạn 24 giờ
        Date expiration = new Date(
                now.getTime() + 24 * 60 * 60 * 1000
        );

        return Jwts.builder()

                // =================================================
                // QUAN TRỌNG:
                // JWT sử dụng EMAIL làm subject.
                //
                // Trước đây:
                // .subject(user.getUsername())
                //
                // Bây giờ:
                // .subject(user.getEmail())
                //
                // Vì hệ thống đăng nhập bằng email.
                // =================================================

                .subject(user.getEmail())

                // Lưu ID user trong JWT
                .claim("userId", user.getId())

                // Lưu role trong JWT
                .claim(
                        "role",
                        user.getRole() != null
                                ? user.getRole().getName()
                                : null
                )

                .issuedAt(now)
                .expiration(expiration)

                // Ký JWT bằng secret key
                .signWith(secretKey)

                .compact();
    }

    // =============================================================
    // LẤY EMAIL TỪ JWT
    // =============================================================

    public String extractUsername(String token) {

        // Tên method vẫn giữ là extractUsername()
        // để không phải sửa các file khác.
        //
        // Nhưng giá trị trả về thực tế bây giờ là EMAIL.

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // =============================================================
    // KIỂM TRA JWT
    // =============================================================

    public boolean isTokenValid(String token) {

        try {

            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            // Token không hợp lệ / hết hạn
            return false;
        }
    }
}