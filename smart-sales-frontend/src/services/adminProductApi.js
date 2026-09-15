import api from "./api";

// =========================================================
// ADMIN / EMPLOYEE
// LẤY TOÀN BỘ SẢN PHẨM
// =========================================================
export const getAdminProducts = async () => {
    const response = await api.get("/products/manage");
    return response.data;
};


// =========================================================
// ADMIN / EMPLOYEE
// LẤY CHI TIẾT SẢN PHẨM
// =========================================================
export const getAdminProductById = async (id) => {
    const response = await api.get(`/products/manage/${id}`);
    return response.data;
};


// =========================================================
// ADMIN + EMPLOYEE
// THÊM SẢN PHẨM
// =========================================================
export const createProduct = async (product) => {
    const response = await api.post("/products", product);
    return response.data;
};


// =========================================================
// ADMIN + EMPLOYEE
// CẬP NHẬT SẢN PHẨM
// =========================================================
export const updateProduct = async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
};


// =========================================================
// ADMIN
// XÓA SẢN PHẨM
// =========================================================
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};


// =========================================================
// ADMIN / EMPLOYEE
// UPLOAD 1 ẢNH
// =========================================================
export const uploadProductImage = async (file) => {

    if (!file) {
        throw new Error("Chưa chọn ảnh sản phẩm.");
    }

    const formData = new FormData();

    // Phải trùng với @RequestParam("file") ở Backend
    formData.append("file", file);

    const response = await api.post(
        "/upload/product-image",
        formData
    );

    return response.data;
};


// =========================================================
// ADMIN / EMPLOYEE
// UPLOAD NHIỀU ẢNH
// =========================================================
export const uploadProductImages = async (files) => {

    if (!files || files.length === 0) {
        throw new Error("Chưa chọn ảnh sản phẩm.");
    }

    const formData = new FormData();

    // Thêm từng ảnh vào FormData
    files.forEach((file) => {
        formData.append("files", file);
    });

    // Phải trùng với @RequestParam("files") ở Backend
    const response = await api.post(
        "/upload/product-images",
        formData
    );

    return response.data;
};


// =========================================================
// LẤY DANH SÁCH ẢNH CỦA SẢN PHẨM
// =========================================================
export const getProductImages = async (productId) => {

    const response = await api.get(
        `/products/${productId}/images`
    );

    return response.data;
};


// =========================================================
// THÊM URL ẢNH VÀO SẢN PHẨM
// =========================================================
export const addProductImages = async (
    productId,
    imageUrls
) => {

    const response = await api.post(
        `/products/${productId}/images`,
        imageUrls
    );

    return response.data;
};


// =========================================================
// ADMIN
// XÓA ẢNH CŨ CỦA SẢN PHẨM
//
// DELETE:
// /products/{productId}/images/{imageId}
// =========================================================

export const deleteProductImage = async (
    productId,
    imageId
) => {

    const response = await api.delete(
        `/products/${productId}/images/${imageId}`
    );

    return response.data;
};


// =========================================================
// ADMIN
// ĐỔI THỨ TỰ ẢNH
//
// imageIds là mảng ID theo thứ tự mới
//
// Ví dụ:
// [5, 2, 8, 1]
//
// =========================================================

export const reorderProductImages = async (
    productId,
    imageIds
) => {

    const response = await api.put(
        `/products/${productId}/images/reorder`,
        imageIds
    );

    return response.data;
};


// =========================================================
// ADMIN
// CHỌN ẢNH CHÍNH
// =========================================================

export const setPrimaryProductImage = async (
    productId,
    imageId
) => {

    const response = await api.put(
        `/products/${productId}/images/${imageId}/primary`
);

return response.data;
};

