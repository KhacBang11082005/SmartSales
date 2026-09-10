package com.smartsales.controller;

import com.smartsales.entity.User;
import com.smartsales.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // =====================================================
    // GET TẤT CẢ USER
    // GET /api/users
    // =====================================================

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }


    // =====================================================
    // GET ADMIN + EMPLOYEE
    //
    // GET /api/users/employees
    //
    // Đây là API frontend sử dụng cho
    // trang Quản lý nhân viên.
    // =====================================================

    @GetMapping("/employees")
    public List<User> getEmployees() {

        return userService.getAllEmployees();
    }


    // =====================================================
    // GET USER THEO ID
    // GET /api/users/{id}
    // =====================================================

    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }


    // =====================================================
    // CREATE USER
    // POST /api/users
    // =====================================================

    @PostMapping
    public User createUser(
            @RequestBody User user) {

        return userService.createUser(user);
    }


    // =====================================================
    // UPDATE USER
    // PUT /api/users/{id}
    // =====================================================

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(
                id,
                user
        );
    }


    // =====================================================
    // DELETE USER
    // DELETE /api/users/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return "Xóa User thành công";
    }
}