import api from "./api";

// =====================================================
// LẤY ROLE DÙNG CHO QUẢN LÝ NHÂN VIÊN
//
// Chỉ lấy:
// - ADMIN
// - EMPLOYEE
//
// Không cho chọn CUSTOMER.
// =====================================================

export const getEmployeeRoles = async () => {

    const response =
        await api.get("/roles");

    const roles = response.data || [];

    return roles.filter(
        role =>
            role.name === "ADMIN" ||
            role.name === "EMPLOYEE"
    );
};