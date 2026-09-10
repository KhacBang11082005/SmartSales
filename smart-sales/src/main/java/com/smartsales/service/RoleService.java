package com.smartsales.service;

import com.smartsales.entity.Role;
import com.smartsales.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // CREATE
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    // READ ALL
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // READ BY ID
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy role với id: " + id
                        )
                );
    }

    // UPDATE
    public Role updateRole(Long id, Role role) {

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy role với id: " + id
                        )
                );

        existingRole.setName(role.getName());
        existingRole.setDescription(role.getDescription());

        return roleRepository.save(existingRole);
    }

    // DELETE
    public void deleteRole(Long id) {

        if (!roleRepository.existsById(id)) {
            throw new RuntimeException(
                    "Không tìm thấy role với id: " + id
            );
        }

        roleRepository.deleteById(id);
    }
}