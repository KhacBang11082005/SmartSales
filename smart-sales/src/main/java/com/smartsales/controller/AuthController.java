package com.smartsales.controller;

import com.smartsales.dto.LoginRequest;
import com.smartsales.dto.LoginResponse;
import com.smartsales.dto.RegisterRequest;
import com.smartsales.service.AuthService;

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