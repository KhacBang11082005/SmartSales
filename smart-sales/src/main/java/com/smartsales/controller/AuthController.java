package com.smartsales.controller;

import com.smartsales.dto.LoginRequest;
import com.smartsales.dto.LoginResponse;
import com.smartsales.dto.RegisterRequest;
import com.smartsales.service.AuthService;


import com.smartsales.dto.ForgotPasswordRequest;
import com.smartsales.dto.VerifyOtpRequest;
import com.smartsales.dto.ResetPasswordRequest;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return authService.login(request);
    }


    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            authService.register(request)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {

            authService.sendForgotPasswordOtp(request);

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Mã OTP đã được gửi đến email của bạn."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

// =====================================================
// VERIFY OTP
// =====================================================

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        try {

            authService.verifyForgotPasswordOtp(request);

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Xác thực OTP thành công."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
// RESET PASSWORD
// =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {

            authService.resetPassword(request);

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Đặt lại mật khẩu thành công."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }
    // =====================================================
    // MESSAGE
    // =====================================================

    public static class MessageResponse {

        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}