import api from "./api";


/* =========================================================
   LẤY TẤT CẢ SẢN PHẨM
========================================================= */

export const getAdminProducts = async () => {

    const response = await api.get("/products");

    return response.data;

};


/* =========================================================
   LẤY SẢN PHẨM THEO ID
========================================================= */

export const getAdminProductById = async (id) => {

    const response = await api.get(`/products/${id}`);

    return response.data;

};


/* =========================================================
   THÊM SẢN PHẨM
========================================================= */

export const createProduct = async (product) => {

    const response = await api.post(
        "/products",
        product
    );

    return response.data;

};


/* =========================================================
   SỬA SẢN PHẨM
========================================================= */

export const updateProduct = async (
    id,
    product
) => {

    const response = await api.put(
        `/products/${id}`,
        product
    );

    return response.data;

};


/* =========================================================
   XÓA SẢN PHẨM
========================================================= */

export const deleteProduct = async (id) => {

    const response = await api.delete(
        `/products/${id}`
    );

    return response.data;

};