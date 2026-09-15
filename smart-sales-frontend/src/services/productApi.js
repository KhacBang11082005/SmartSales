import api from "./api";


// =========================================================
// LẤY DANH SÁCH SẢN PHẨM
// =========================================================

export const getProducts = async () => {

    const response =
        await api.get("/products");

    return response.data;
};


// =========================================================
// LẤY CHI TIẾT SẢN PHẨM
// =========================================================

export const getProductById = async (id) => {

    const response =
        await api.get(`/products/${id}`);

    return response.data;
};


// =========================================================
// LẤY NHIỀU ẢNH CỦA SẢN PHẨM
// =========================================================

export const getProductImages = async (productId) => {

    const response =
        await api.get(
            `/products/${productId}/images`
        );

    return response.data;
};