import api from "./api";

// =========================================================
// ADMIN / EMPLOYEE
// Lấy toàn bộ sản phẩm
// Bao gồm cả ACTIVE và INACTIVE
// =========================================================
export const getAdminProducts = async () => {
    const response = await api.get("/products/manage");
    return response.data;
};

// =========================================================
// ADMIN / EMPLOYEE
// Lấy chi tiết sản phẩm
// =========================================================
export const getAdminProductById = async (id) => {
    const response = await api.get(`/products/manage/${id}`);
    return response.data;
};

// =========================================================
// ADMIN + EMPLOYEE
// Thêm sản phẩm
// =========================================================
export const createProduct = async (product) => {
    const response = await api.post("/products", product);
    return response.data;
};

// =========================================================
// ADMIN + EMPLOYEE
// Cập nhật sản phẩm
// =========================================================
export const updateProduct = async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
};

// =========================================================
// ADMIN
// Xóa sản phẩm
// =========================================================
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};