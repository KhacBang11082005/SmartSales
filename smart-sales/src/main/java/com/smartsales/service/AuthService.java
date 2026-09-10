package com.smartsales.service;

import com.smartsales.dto.LoginRequest;
import com.smartsales.dto.LoginResponse;
import com.smartsales.dto.RegisterRequest;

import com.smartsales.entity.Customer;
import com.smartsales.entity.Role;
import com.smartsales.entity.User;

import com.smartsales.repository.CustomerRepository;
import com.smartsales.repository.RoleRepository;
import com.smartsales.repository.UserRepository;

import com.smartsales.security.JwtService;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final CustomerRepository customerRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;


    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;

        this.customerRepository = customerRepository;

        this.roleRepository = roleRepository;

        this.passwordEncoder = passwordEncoder;

        this.jwtService = jwtService;
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResponse login(
            LoginRequest request) {

        User user =
                userRepository
                        .findByEmail(
                                request.getUsername()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Email hoặc mật khẩu không đúng"
                                )
                        );


        if (
                user.getStatus()
                        != User.Status.ACTIVE
        ) {

            throw new RuntimeException(
                    "Tài khoản hiện không hoạt động"
            );
        }


        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Email hoặc mật khẩu không đúng"
            );
        }


        String token =
                jwtService.generateToken(user);


        return new LoginResponse(

                user.getId(),

                user.getUsername(),

                user.getEmail(),

                user.getFullName(),

                user.getRole().getName(),

                user.getStatus().name(),

                token
        );
    }


    // =====================================================
    // REGISTER
    // =====================================================

    @Transactional
    public LoginResponse register(
            RegisterRequest request) {


        // -------------------------------------------------
        // CHECK DATA
        // -------------------------------------------------

        if (request == null) {

            throw new RuntimeException(
                    "Dữ liệu đăng ký không hợp lệ."
            );
        }


        String fullName =
                request.getFullName() == null
                        ? ""
                        : request.getFullName().trim();


        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                        .trim()
                        .toLowerCase();


        String phone =
                request.getPhone() == null
                        ? ""
                        : request.getPhone().trim();


        String password =
                request.getPassword();


        String confirmPassword =
                request.getConfirmPassword();


        // -------------------------------------------------
        // REQUIRED
        // -------------------------------------------------

        if (
                fullName.isEmpty() ||
                        email.isEmpty() ||
                        phone.isEmpty() ||
                        password == null ||
                        password.isEmpty() ||
                        confirmPassword == null ||
                        confirmPassword.isEmpty()
        ) {

            throw new RuntimeException(
                    "Vui lòng nhập đầy đủ thông tin."
            );
        }


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        if (
                !email.matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
                )
        ) {

            throw new RuntimeException(
                    "Email không hợp lệ."
            );
        }


        // -------------------------------------------------
        // PHONE
        // -------------------------------------------------

        if (
                !phone.matches(
                        "^0\\d{9,10}$"
                )
        ) {

            throw new RuntimeException(
                    "Số điện thoại không hợp lệ."
            );
        }


        // -------------------------------------------------
        // PASSWORD
        // -------------------------------------------------

        if (password.length() < 6) {

            throw new RuntimeException(
                    "Mật khẩu phải có ít nhất 6 ký tự."
            );
        }


        // -------------------------------------------------
        // CONFIRM PASSWORD
        // -------------------------------------------------

        if (
                !password.equals(
                        confirmPassword
                )
        ) {

            throw new RuntimeException(
                    "Mật khẩu nhập lại không khớp."
            );
        }


        // -------------------------------------------------
        // EMAIL EXISTS
        // -------------------------------------------------

        if (
                userRepository
                        .findByEmail(email)
                        .isPresent()
        ) {

            throw new RuntimeException(
                    "Email này đã được sử dụng."
            );
        }


        // -------------------------------------------------
        // ROLE CUSTOMER
        // -------------------------------------------------

        Role customerRole =
                roleRepository
                        .findAll()
                        .stream()
                        .filter(role ->
                                "CUSTOMER"
                                        .equalsIgnoreCase(
                                                role.getName()
                                        )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Chưa có role CUSTOMER trong database."
                                )
                        );


        // =================================================
        // TẠO USER
        // =================================================

        User user = new User();

        user.setUsername(email);

        user.setEmail(email);

        user.setFullName(fullName);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(customerRole);

        user.setStatus(
                User.Status.ACTIVE
        );

        user.setCreatedAt(
                LocalDateTime.now()
        );


        user =
                userRepository.save(user);


        // =================================================
        // TẠO CUSTOMER
        // =================================================

        Customer customer =
                new Customer();

        customer.setUser(user);

        customer.setPhone(phone);

        customer.setAddress("");

        customer.setCreatedAt(
                LocalDateTime.now()
        );


        customerRepository.save(customer);


        // =================================================
        // JWT
        // =================================================

        String token =
                jwtService.generateToken(user);


        // =================================================
        // RETURN
        // =================================================

        return new LoginResponse(

                user.getId(),

                user.getUsername(),

                user.getEmail(),

                user.getFullName(),

                user.getRole().getName(),

                user.getStatus().name(),

                token
        );
    }
}