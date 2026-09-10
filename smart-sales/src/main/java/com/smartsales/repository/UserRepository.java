package com.smartsales.repository;

import com.smartsales.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm tài khoản theo username
    Optional<User> findByUsername(String username);

    // Tìm tài khoản theo email
    Optional<User> findByEmail(String email);

    // Kiểm tra username đã tồn tại chưa
    boolean existsByUsername(String username);

    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);

    // Lấy danh sách ADMIN + EMPLOYEE
    List<User> findByRole_NameInOrderByCreatedAtDesc(
            List<String> roleNames
    );

    // Đếm số lượng user theo role
    long countByRole_Id(Long roleId);
}