package com.smartsales.service;

import com.smartsales.entity.User;
import com.smartsales.repository.UserRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * =========================================================
 * CUSTOMER ACCOUNT STATUS SCHEDULER
 * =========================================================
 *
 * Nhiệm vụ:
 *
 * Tự động kiểm tra tài khoản CUSTOMER.
 *
 * Nếu CUSTOMER:
 *
 * - Không bị ADMIN khóa
 * - Đã quá 7 ngày không đăng nhập
 *
 * thì:
 *
 * ACTIVE -> INACTIVE
 *
 * =========================================================
 */
@Component
public class CustomerAccountStatusScheduler {


    private final UserRepository userRepository;


    public CustomerAccountStatusScheduler(
            UserRepository userRepository
    ) {

        this.userRepository =
                userRepository;
    }


    /**
     * =====================================================
     * KIỂM TRA TÀI KHOẢN KHÁCH HÀNG
     * =====================================================
     *
     * Chạy tự động mỗi 15 phút.
     *
     * fixedDelay = 900000
     *
     * 900000 milliseconds = 15 phút
     *
     * =====================================================
     */

    @Scheduled(fixedDelay = 900000)
    @Transactional
    public void updateInactiveCustomers() {

        // =================================================
        // Thời điểm hiện tại
        // =================================================

        LocalDateTime now =
                LocalDateTime.now();


        // =================================================
        // Mốc 7 ngày trước
        // =================================================

        LocalDateTime sevenDaysAgo =
                now.minusDays(7);


        // =================================================
        // Lấy toàn bộ CUSTOMER
        // =================================================

        List<User> customers =
                userRepository
                        .findByRole_NameIgnoreCase(
                                "CUSTOMER"
                        );


        // =================================================
        // KIỂM TRA TỪNG CUSTOMER
        // =================================================

        for (User user : customers) {


            // =============================================
            // KHÔNG ĐỘNG VÀO TÀI KHOẢN ĐÃ KHÓA
            //
            // LOCKED là trạng thái do ADMIN đặt.
            //
            // Scheduler tuyệt đối không được tự ý
            // chuyển LOCKED sang INACTIVE.
            // =============================================

            if (
                    user.getStatus()
                            == User.Status.LOCKED
            ) {

                continue;
            }


            // =============================================
            // XÁC ĐỊNH NGÀY HOẠT ĐỘNG CUỐI
            //
            // Nếu khách hàng chưa từng đăng nhập:
            // dùng createdAt làm mốc.
            //
            // Nếu đã đăng nhập:
            // dùng lastLoginAt.
            // =============================================

            LocalDateTime lastActivity =
                    user.getLastLoginAt();


            if (lastActivity == null) {

                lastActivity =
                        user.getCreatedAt();
            }


            // =============================================
            // Nếu chưa có cả createdAt
            // thì bỏ qua để tránh lỗi.
            // =============================================

            if (lastActivity == null) {

                continue;
            }


            // =============================================
            // KIỂM TRA QUÁ 7 NGÀY
            // =============================================

            if (
                    lastActivity
                            .isBefore(
                                    sevenDaysAgo
                            )
            ) {

                // =========================================
                // Chỉ ACTIVE mới được chuyển thành
                // INACTIVE.
                //
                // Không thay đổi LOCKED.
                // =========================================

                if (
                        user.getStatus()
                                == User.Status.ACTIVE
                ) {

                    user.setStatus(
                            User.Status.INACTIVE
                    );

                    userRepository.save(user);
                }
            }
        }
    }
}