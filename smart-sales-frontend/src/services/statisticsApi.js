import api from "./api";

// =========================================================
// LẤY TOP 5 SẢN PHẨM BÁN CHẠY
// =========================================================

export const getTopSellingProducts = async () => {

    const response =
        await api.get("/statistics/top-products");

    return response.data;
};