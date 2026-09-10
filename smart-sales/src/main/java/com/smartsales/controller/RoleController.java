package com.smartsales.controller;

import com.smartsales.entity.Role;
import com.smartsales.service.RoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // CREATE
    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleService.createRole(role);
    }

    // READ ALL
    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Role updateRole(
            @PathVariable Long id,
            @RequestBody Role role) {

        return roleService.updateRole(id, role);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Long id) {

        roleService.deleteRole(id);

        return "Xóa role thành công";
    }
}