import api from "./api";

// =========================================================
// KHUYẾN MẠI
//
// File này chứa API cho:
// 1. CUSTOMER - Áp dụng mã khuyến mại khi Checkout
// 2. ADMIN    - Quản lý chương trình khuyến mại
// =========================================================


// =========================================================
// CUSTOMER
// KIỂM TRA / ÁP DỤNG MÃ KHUYẾN MẠI
// =========================================================
//
// Hỗ trợ:
// - ALL       : tất cả sản phẩm
// - CATEGORY  : sản phẩm thuộc danh mục được chọn
// - PRODUCT   : sản phẩm cụ thể được chọn
// =========================================================

export const validatePromotion = async (
    code,
    orderAmount,
    customerId,
    items
) => {

    const response = await api.post(
        "/promotions/validate",
        {
            // Mã khuyến mại
            code: code,

            // Tổng tiền các sản phẩm đang thanh toán
            orderAmount: orderAmount,

            // ID khách hàng đang đăng nhập
            customerId: customerId,

            // Danh sách sản phẩm áp dụng khuyến mại
            //
            // Ví dụ:
            // [
            //     {
            //         productId: 1,
            //         quantity: 2
            //     },
            //     {
            //         productId: 5,
            //         quantity: 1
            //     }
            // ]
            //
            // Backend sẽ dựa vào danh sách này
            // để kiểm tra scope của promotion.
            items: items
        }
    );

    return response.data;
};


// =========================================================
// ADMIN
// LẤY TẤT CẢ CHƯƠNG TRÌNH KHUYẾN MẠI
// =========================================================

export const getPromotions = async () => {

    const response = await api.get(
        "/promotions"
    );

    return response.data;
};


// =========================================================
// ADMIN
// LẤY CHI TIẾT MỘT CHƯƠNG TRÌNH KHUYẾN MẠI
// =========================================================

export const getPromotionById = async (id) => {

    const response = await api.get(
        `/promotions/${id}`
    );

    return response.data;
};


// =========================================================
// ADMIN
// THÊM CHƯƠNG TRÌNH KHUYẾN MẠI
// =========================================================
//
// Dữ liệu gửi lên:
//
// {
//     name,
//     code,
//     discountType,
//     discountValue,
//     maxDiscount,
//     minOrderAmount,
//     usageLimit,
//     startDate,
//     endDate,
//     status,
//     scopeType,
//     categoryIds,
//     productIds
// }
// =========================================================

export const createPromotion = async (promotionData) => {

    const response = await api.post(
        "/promotions",
        promotionData
    );

    return response.data;
};


// =========================================================
// ADMIN
// CẬP NHẬT CHƯƠNG TRÌNH KHUYẾN MẠI
// =========================================================

export const updatePromotion = async (
    id,
    promotionData
) => {

    const response = await api.put(
        `/promotions/${id}`,
        promotionData
    );

    return response.data;
};


// =========================================================
// ADMIN
// XÓA CHƯƠNG TRÌNH KHUYẾN MẠI
// =========================================================

export const deletePromotion = async (id) => {

    const response = await api.delete(
        `/promotions/${id}`
    );

    return response.data;
};