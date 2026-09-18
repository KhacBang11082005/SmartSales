import api from "./api";

// =========================================================
// KHUYẾN MẠI
// Kiểm tra mã khuyến mại trước khi đặt hàng
// =========================================================

export const validatePromotion = async (
    code,
    orderAmount,
    customerId
) => {

    const response = await api.post(
        "/promotions/validate",
        {
            code: code,
            orderAmount: orderAmount,
            customerId: customerId
        }
    );

    return response.data;
};