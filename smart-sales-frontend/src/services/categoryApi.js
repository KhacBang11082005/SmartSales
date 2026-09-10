import api from "./api";

// Lấy tất cả danh mục
export const getCategories = async () => {
    const response = await api.get("/categories");
    return response.data;
};

// Lấy danh mục theo ID
export const getCategoryById = async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

// Thêm danh mục
export const createCategory = async (category) => {
    const response = await api.post("/categories", category);
    return response.data;
};

// Sửa danh mục
export const updateCategory = async (id, category) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
};

// Xóa danh mục
export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};