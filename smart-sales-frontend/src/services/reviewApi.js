import api from "./api";

// =========================================================
// LẤY DANH SÁCH REVIEW CỦA SẢN PHẨM
// =========================================================

export const getProductReviews = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}`
    );

    return response.data;
};

// =========================================================
// LẤY THỐNG KÊ REVIEW
// =========================================================

export const getReviewSummary = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/summary`
    );

    return response.data;
};

// =========================================================
// LẤY PHÂN BỐ SỐ SAO
// =========================================================

export const getRatingDistribution = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/rating-distribution`
    );

    return response.data;
};

// =========================================================
// KIỂM TRA CÓ THỂ ĐÁNH GIÁ SẢN PHẨM KHÔNG
// =========================================================

export const canReviewProduct = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/can-review`
    );

    return response.data;
};

// =========================================================
// API CŨ
//
// Giữ lại để không làm hỏng các chức năng hiện tại.
// =========================================================

export const getMyReview = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/my-review`
    );

    return response.data;
};

// =========================================================
// API MỚI
//
// LẤY REVIEW THEO ORDER DETAIL
//
// Một sản phẩm có thể xuất hiện ở nhiều đơn hàng,
// vì vậy phải dùng orderDetailId để xác định chính xác
// review thuộc đơn hàng nào.
// =========================================================

export const getMyReviewByOrderDetail = async (
    orderDetailId
) => {

    const response = await api.get(
        `/reviews/order-detail/${orderDetailId}`
    );

    return response.data;
};

// =========================================================
// TẠO REVIEW
//
// orderDetailId bắt buộc phải được gửi lên Backend.
// =========================================================

export const createReview = async (
    productId,
    orderDetailId,
    rating,
    comment
) => {

    const response = await api.post(
        `/reviews/product/${productId}`,
        {
            orderDetailId,
            rating,
            comment
        }
    );

    return response.data;
};

// =========================================================
// SỬA REVIEW
// =========================================================

export const updateReview = async (
    productId,
    orderDetailId,
    rating,
    comment
) => {

    const response = await api.put(
        `/reviews/product/${productId}`,
        {
            orderDetailId,
            rating,
            comment
        }
    );

    return response.data;
};

// =========================================================
// UPLOAD ẢNH / VIDEO REVIEW
// =========================================================

export const uploadReviewMedia = async (
    reviewId,
    files
) => {

    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post(
        `/reviews/${reviewId}/media`,
        formData
    );

    return response.data;
};

// =========================================================
// XÓA MEDIA REVIEW
// =========================================================

export const deleteReviewMedia = async (
    mediaId
) => {

    const response = await api.delete(
        `/reviews/media/${mediaId}`
    );

    return response.data;
};