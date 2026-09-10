package com.smartsales.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@JsonPropertyOrder({
        "id",
        "username",
        "email",
        "fullName",
        "role",
        "status",
        "createdAt"
})
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên đăng nhập
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    // Mật khẩu.
    // WRITE_ONLY: frontend có thể gửi password lên khi tạo/sửa
    // nhưng API GET sẽ không trả password về.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, length = 255)
    private String password;

    // Email
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Họ và tên
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    // Role của tài khoản: ADMIN / EMPLOYEE / CUSTOMER
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // Trạng thái tài khoản
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    // Ngày tạo tài khoản
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum Status {
        ACTIVE,
        INACTIVE,
        LOCKED
    }

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}