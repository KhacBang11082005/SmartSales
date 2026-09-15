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

import com.smartsales.dto.ForgotPasswordRequest;
import com.smartsales.dto.VerifyOtpRequest;
import com.smartsales.dto.ResetPasswordRequest;

import com.smartsales.entity.PasswordResetToken;

import com.smartsales.repository.PasswordResetTokenRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.security.SecureRandom;


import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final CustomerRepository customerRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom = new SecureRandom();


    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;

        this.customerRepository = customerRepository;

        this.roleRepository = roleRepository;

        this.passwordEncoder = passwordEncoder;

        this.jwtService = jwtService;

        this.passwordResetTokenRepository =
                passwordResetTokenRepository;

        this.mailSender = mailSender;
    }

// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

    public void sendForgotPasswordOtp(
            ForgotPasswordRequest request) {

        if (request == null ||
                request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Vui lòng nhập email."
            );
        }


        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();


        // -------------------------------------------------
        // KIỂM TRA EMAIL
        // -------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Email không tồn tại trong hệ thống."
                                )
                        );


        // -------------------------------------------------
        // KIỂM TRA TÀI KHOẢN
        // -------------------------------------------------

        if (user.getStatus() != User.Status.ACTIVE) {

            throw new RuntimeException(
                    "Tài khoản hiện không hoạt động."
            );
        }


        // -------------------------------------------------
        // TẠO OTP 6 SỐ
        // -------------------------------------------------

        String otp =
                String.format(
                        "%06d",
                        secureRandom.nextInt(1000000)
                );


        // -------------------------------------------------
        // TẠO TOKEN
        // OTP CÓ HIỆU LỰC 10 PHÚT
        // -------------------------------------------------

        PasswordResetToken token =
                new PasswordResetToken();

        token.setEmail(email);

        token.setOtp(otp);

        token.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(10)
        );

        token.setVerified(false);


        passwordResetTokenRepository.save(token);


        // -------------------------------------------------
        // GỬI EMAIL
        // -------------------------------------------------

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "SmartSales - Mã OTP đặt lại mật khẩu"
        );

        message.setText(
                "Xin chào " +
                        user.getFullName() +
                        ",\n\n" +

                        "Mã OTP để đặt lại mật khẩu SmartSales của bạn là: "
                        + otp +
                        "\n\n" +

                        "Mã OTP có hiệu lực trong 10 phút.\n\n" +

                        "Nếu bạn không yêu cầu đặt lại mật khẩu, "
                        + "vui lòng bỏ qua email này.\n\n" +

                        "SmartSales"
        );


        mailSender.send(message);
    }


    // =====================================================
// VERIFY OTP
// =====================================================

    public void verifyForgotPasswordOtp(
            VerifyOtpRequest request) {

        if (request == null ||
                request.getEmail() == null ||
                request.getOtp() == null) {

            throw new RuntimeException(
                    "Dữ liệu không hợp lệ."
            );
        }


        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        String otp =
                request.getOtp()
                        .trim();


        PasswordResetToken token =
                passwordResetTokenRepository
                        .findTopByEmailOrderByIdDesc(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mã OTP không tồn tại hoặc đã hết hạn."
                                )
                        );


        // -------------------------------------------------
        // KIỂM TRA THỜI GIAN
        // -------------------------------------------------

        if (
                token.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."
            );
        }


        // -------------------------------------------------
        // KIỂM TRA OTP
        // -------------------------------------------------

        if (!token.getOtp().equals(otp)) {

            throw new RuntimeException(
                    "Mã OTP không chính xác."
            );
        }


        // -------------------------------------------------
        // XÁC NHẬN
        // -------------------------------------------------

        token.setVerified(true);

        passwordResetTokenRepository.save(token);
    }

    // =====================================================
// RESET PASSWORD
// =====================================================

    @Transactional
    public void resetPassword(
            ResetPasswordRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Dữ liệu không hợp lệ."
            );
        }


        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                        .trim()
                        .toLowerCase();


        String otp =
                request.getOtp() == null
                        ? ""
                        : request.getOtp().trim();


        String newPassword =
                request.getNewPassword();


        String confirmPassword =
                request.getConfirmPassword();


        // -------------------------------------------------
        // KIỂM TRA
        // -------------------------------------------------

        if (
                email.isEmpty() ||
                        otp.isEmpty() ||
                        newPassword == null ||
                        confirmPassword == null
        ) {

            throw new RuntimeException(
                    "Vui lòng nhập đầy đủ thông tin."
            );
        }


        // -------------------------------------------------
        // KIỂM TRA MẬT KHẨU
        // -------------------------------------------------

        if (newPassword.length() < 6) {

            throw new RuntimeException(
                    "Mật khẩu phải có ít nhất 6 ký tự."
            );
        }


        if (!newPassword.equals(confirmPassword)) {

            throw new RuntimeException(
                    "Mật khẩu nhập lại không khớp."
            );
        }


        // -------------------------------------------------
        // TÌM OTP
        // -------------------------------------------------

        PasswordResetToken token =
                passwordResetTokenRepository
                        .findTopByEmailOrderByIdDesc(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mã OTP không tồn tại."
                                )
                        );


        // -------------------------------------------------
        // KIỂM TRA OTP
        // -------------------------------------------------

        if (!token.getOtp().equals(otp)) {

            throw new RuntimeException(
                    "Mã OTP không chính xác."
            );
        }


        // -------------------------------------------------
        // KIỂM TRA HẠN
        // -------------------------------------------------

        if (
                token.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Mã OTP đã hết hạn."
            );
        }


        // -------------------------------------------------
        // PHẢI ĐƯỢC VERIFY
        // -------------------------------------------------

        if (!token.isVerified()) {

            throw new RuntimeException(
                    "Vui lòng xác thực mã OTP trước."
            );
        }


        // -------------------------------------------------
        // TÌM USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy tài khoản."
                                )
                        );


        // -------------------------------------------------
        // ĐỔI MẬT KHẨU
        // -------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );


        userRepository.save(user);


        // -------------------------------------------------
        // XÓA OTP ĐÃ SỬ DỤNG
        // -------------------------------------------------

        passwordResetTokenRepository.delete(token);
    }
    // =====================================================
    // LOGIN
    // =====================================================

    // =========================================================
// LOGIN
// =========================================================
//
// Quy tắc:
//
// 1. Không tìm thấy email
//    -> Email hoặc mật khẩu không đúng
//
// 2. Tài khoản LOCKED
//    -> Không cho đăng nhập
//    -> Trả thông báo tài khoản bị khóa
//
// 3. Tài khoản INACTIVE
//    -> Vẫn cho đăng nhập
//    -> Sau khi đăng nhập thành công:
//       INACTIVE -> ACTIVE
//
// 4. Đăng nhập thành công:
//    -> cập nhật lastLoginAt
//
// =========================================================

    @Transactional
    public LoginResponse login(
            LoginRequest request) {

        // =====================================================
        // 1. TÌM USER THEO EMAIL
        // =====================================================

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


        // =====================================================
        // 2. KIỂM TRA TÀI KHOẢN BỊ KHÓA
        //
        // LOCKED là do ADMIN chủ động khóa.
        //
        // Tài khoản LOCKED tuyệt đối không được đăng nhập.
        // =====================================================

        if (user.getStatus() == User.Status.LOCKED) {

            throw new RuntimeException(
                    "Tài khoản của bạn đã bị khóa. " +
                            "Vui lòng liên hệ quản trị viên."
            );
        }


        // =====================================================
        // 3. KIỂM TRA MẬT KHẨU
        // =====================================================

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


        // =====================================================
        // 4. ĐĂNG NHẬP THÀNH CÔNG
        //
        // Lưu thời gian đăng nhập mới nhất.
        //
        // Ví dụ:
        //
        // 14/09/2026 20:00
        //
        // Nếu lần sau đăng nhập:
        //
        // 15/09/2026 20:00
        //
        // lastLoginAt sẽ được cập nhật lại.
        // =====================================================

        user.setLastLoginAt(
                LocalDateTime.now()
        );


        // =====================================================
        // 5. NẾU TÀI KHOẢN ĐANG INACTIVE
        //
        // Có nghĩa là tài khoản trước đó đã hơn 7 ngày
        // không đăng nhập.
        //
        // Nhưng bây giờ khách hàng đã đăng nhập thành công,
        // vì vậy chuyển lại ACTIVE.
        // =====================================================

        if (user.getStatus() == User.Status.INACTIVE) {

            user.setStatus(
                    User.Status.ACTIVE
            );
        }


        // =====================================================
        // 6. LƯU USER
        // =====================================================

        userRepository.save(user);


        // =====================================================
        // 7. TẠO JWT
        // =====================================================

        String token =
                jwtService.generateToken(user);


        // =====================================================
        // 8. TRẢ LOGIN RESPONSE
        // =====================================================

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