package com.smartsales.service;

import com.smartsales.entity.Role;
import com.smartsales.entity.User;
import com.smartsales.repository.RoleRepository;
import com.smartsales.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // LẤY TẤT CẢ USER
    // =====================================================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =====================================================
    // LẤY DANH SÁCH NHÂN VIÊN
    //
    // Chỉ lấy:
    // - ADMIN
    // - EMPLOYEE
    //
    // CUSTOMER được quản lý ở phần khách hàng.
    // =====================================================
    public List<User> getAllEmployees() {

        return userRepository
                .findByRole_NameInOrderByCreatedAtDesc(
                        List.of("ADMIN", "EMPLOYEE")
                );
    }

    // =====================================================
    // LẤY USER THEO ID
    // =====================================================
    public User getUserById(Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy User"
                        )
                );
    }

    // =====================================================
    // THÊM NHÂN VIÊN
    //
    // QUAN TRỌNG:
    // Người dùng KHÔNG cần nhập username.
    //
    // Backend tự động:
    //
    // username = email
    //
    // Ví dụ:
    // email = nguyenvana@gmail.com
    //
    // thì:
    // username = nguyenvana@gmail.com
    //
    // Như vậy cấu trúc database cũ vẫn hoạt động,
    // nhưng người dùng đăng nhập bằng email.
    // =====================================================
    public User createUser(User user) {

        validateUser(user, true);

        // Lấy email
        String email = user.getEmail()
                .trim()
                .toLowerCase();

        // =================================================
        // KIỂM TRA EMAIL TRÙNG
        // =================================================
        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "Email đã tồn tại"
            );
        }

        // =================================================
        // LẤY ROLE
        // Chỉ cho phép ADMIN hoặc EMPLOYEE.
        // =================================================
        Role role =
                findEmployeeRole(
                        getRoleName(user)
                );

        // =================================================
        // GÁN THÔNG TIN
        // =================================================

        user.setEmail(email);

        // Không cần nhập username.
        // Backend tự dùng email làm username nội bộ.
        user.setUsername(email);

        user.setFullName(
                user.getFullName().trim()
        );

        user.setRole(role);

        // Mã hóa mật khẩu trước khi lưu database.
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        // Nếu không gửi status thì mặc định ACTIVE.
        if (user.getStatus() == null) {

            user.setStatus(
                    User.Status.ACTIVE
            );
        }

        user.setCreatedAt(
                LocalDateTime.now()
        );

        return userRepository.save(user);
    }

    // =====================================================
    // CẬP NHẬT NHÂN VIÊN
    //
    // Email chính là thông tin đăng nhập.
    //
    // Nếu đổi email:
    // username nội bộ cũng đổi theo email mới.
    //
    // Nếu không nhập mật khẩu:
    // giữ nguyên mật khẩu cũ.
    // =====================================================
    public User updateUser(
            Long id,
            User user) {

        // Lấy user hiện tại
        User existing =
                getUserById(id);

        validateUser(user, false);

        // Email mới
        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        // =================================================
        // KIỂM TRA EMAIL TRÙNG VỚI USER KHÁC
        // =================================================
        if (!existing.getEmail()
                .equalsIgnoreCase(email)
                && userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "Email đã tồn tại"
            );
        }

        // =================================================
        // CẬP NHẬT EMAIL
        // =================================================
        existing.setEmail(email);

        // =================================================
        // EMAIL = USERNAME NỘI BỘ
        // =================================================
        existing.setUsername(email);

        // =================================================
        // CẬP NHẬT HỌ TÊN
        // =================================================
        existing.setFullName(
                user.getFullName().trim()
        );

        // =================================================
        // CẬP NHẬT ROLE
        // =================================================
        existing.setRole(
                findEmployeeRole(
                        getRoleName(user)
                )
        );

        // =================================================
        // CẬP NHẬT STATUS
        // =================================================
        if (user.getStatus() != null) {

            existing.setStatus(
                    user.getStatus()
            );
        }

        // =================================================
        // CẬP NHẬT PASSWORD
        //
        // Nếu password trống:
        // => giữ password cũ.
        //
        // Nếu có password:
        // => mã hóa password mới.
        // =================================================
        if (user.getPassword() != null
                && !user.getPassword()
                .trim()
                .isEmpty()) {

            existing.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()
                    )
            );
        }

        return userRepository.save(existing);
    }

    // =====================================================
    // XÓA USER
    // =====================================================
    public void deleteUser(Long id) {

        User existing =
                getUserById(id);

        String roleName =
                existing.getRole() == null
                        ? ""
                        : existing.getRole()
                        .getName();

        // CUSTOMER không được xóa tại phần nhân viên.
        if ("CUSTOMER".equalsIgnoreCase(
                roleName)) {

            throw new RuntimeException(
                    "Không thể xóa tài khoản khách hàng tại đây"
            );
        }

        // =================================================
        // KHÔNG CHO XÓA ADMIN CUỐI CÙNG
        // =================================================
        if ("ADMIN".equalsIgnoreCase(roleName)
                && existing.getRole() != null) {

            long count =
                    userRepository
                            .countByRole_Id(
                                    existing.getRole().getId()
                            );

            if (count <= 1) {

                throw new RuntimeException(
                        "Không thể xóa ADMIN cuối cùng của hệ thống"
                );
            }
        }

        userRepository.delete(existing);
    }

    // =====================================================
    // VALIDATE USER
    // =====================================================
    private void validateUser(
            User user,
            boolean creating) {

        if (user == null) {

            throw new RuntimeException(
                    "Dữ liệu User không hợp lệ"
            );
        }

        // =================================================
        // EMAIL
        // =================================================
        if (user.getEmail() == null
                || user.getEmail()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Email không được để trống"
            );
        }

        // =================================================
        // HỌ TÊN
        // =================================================
        if (user.getFullName() == null
                || user.getFullName()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Họ tên không được để trống"
            );
        }

        // =================================================
        // PASSWORD
        //
        // Khi thêm mới bắt buộc có password.
        // Khi sửa thì có thể bỏ trống.
        // =================================================
        if (creating
                && (user.getPassword() == null
                || user.getPassword()
                .trim()
                .isEmpty())) {

            throw new RuntimeException(
                    "Mật khẩu không được để trống"
            );
        }

        // =================================================
        // KIỂM TRA EMAIL
        // =================================================
        if (!user.getEmail()
                .trim()
                .matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
                )) {

            throw new RuntimeException(
                    "Email không hợp lệ"
            );
        }

        // =================================================
        // ROLE
        // =================================================
        if (user.getRole() == null
                || user.getRole().getName() == null
                || user.getRole()
                .getName()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Role không được để trống"
            );
        }
    }

    // =====================================================
    // LẤY TÊN ROLE
    // =====================================================
    private String getRoleName(User user) {

        return user.getRole()
                .getName()
                .trim()
                .toUpperCase();
    }

    // =====================================================
    // TÌM ROLE NHÂN VIÊN
    //
    // Chỉ cho:
    // - ADMIN
    // - EMPLOYEE
    //
    // Không cho tạo CUSTOMER bằng màn hình này.
    // =====================================================
    private Role findEmployeeRole(
            String roleName) {

        if (!"ADMIN".equals(roleName)
                && !"EMPLOYEE".equals(roleName)) {

            throw new RuntimeException(
                    "Chỉ được sử dụng role ADMIN hoặc EMPLOYEE"
            );
        }

        return roleRepository
                .findAll()
                .stream()
                .filter(role ->
                        role.getName() != null
                                && role.getName()
                                .equalsIgnoreCase(
                                        roleName
                                )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy role: "
                                        + roleName
                        )
                );
    }
}