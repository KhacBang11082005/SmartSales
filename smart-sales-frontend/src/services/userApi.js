import api from "./api";

// =====================================================
// LẤY DANH SÁCH NHÂN VIÊN
// Bao gồm ADMIN + EMPLOYEE
// =====================================================

export const getEmployees = async () => {

    const response =
        await api.get("/users/employees");

    return response.data;
};


// =====================================================
// LẤY TẤT CẢ USER
// =====================================================

export const getUsers = async () => {

    const response =
        await api.get("/users");

    return response.data;
};


// =====================================================
// LẤY USER THEO ID
// =====================================================

export const getUserById = async (id) => {

    const response =
        await api.get(`/users/${id}`);

    return response.data;
};


// =====================================================
// THÊM USER
// =====================================================

export const createUser = async (user) => {

    const response =
        await api.post("/users", user);

    return response.data;
};


// =====================================================
// CẬP NHẬT USER
// =====================================================

export const updateUser = async (id, user) => {

    const response =
        await api.put(
            `/users/${id}`,
            user
        );

    return response.data;
};


// =====================================================
// XÓA USER
// =====================================================

export const deleteUser = async (id) => {

    const response =
        await api.delete(`/users/${id}`);

    return response.data;
};