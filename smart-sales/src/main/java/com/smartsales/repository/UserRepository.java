package com.smartsales.repository;

import com.smartsales.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // =========================================================
    // TÌM USER THEO USERNAME
    // =========================================================

    Optional<User> findByUsername(String username);


    // =========================================================
    // TÌM USER THEO EMAIL
    //
    // SmartSales hiện tại đăng nhập bằng email.
    // =========================================================

    Optional<User> findByEmail(String email);


    // =========================================================
    // KIỂM TRA USERNAME ĐÃ TỒN TẠI
    // =========================================================

    boolean existsByUsername(String username);


    // =========================================================
    // KIỂM TRA EMAIL ĐÃ TỒN TẠI
    // =========================================================

    boolean existsByEmail(String email);


    // =========================================================
    // LẤY ADMIN + EMPLOYEE
    // =========================================================

    List<User> findByRole_NameInOrderByCreatedAtDesc(
            List<String> roleNames
    );


    // =========================================================
    // ĐẾM USER THEO ROLE
    // =========================================================

    long countByRole_Id(Long roleId);


    // =========================================================
    // LẤY CÁC CUSTOMER
    //
    // Dùng cho Scheduler kiểm tra:
    // CUSTOMER nào đã quá 7 ngày không đăng nhập.
    // =========================================================
    List<User> findByRole_NameIgnoreCase(
            String roleName
    );
}