import api from "./api";

// =========================================================
// LẤY TẤT CẢ REVIEW CỦA SẢN PHẨM
// PUBLIC
// =========================================================
export const getProductReviews = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}`
    );

    return response.data;
};


// =========================================================
// LẤY THỐNG KÊ REVIEW
// - averageRating
// - reviewCount
// PUBLIC
// =========================================================
export const getReviewSummary = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/summary`
    );

    return response.data;
};


// =========================================================
// LẤY PHÂN BỐ 1★ → 5★
// PUBLIC
// =========================================================
export const getRatingDistribution = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/rating-distribution`
    );

    return response.data;
};


// =========================================================
// KIỂM TRA KHÁCH HÀNG CÓ ĐƯỢC ĐÁNH GIÁ KHÔNG
// CUSTOMER
// =========================================================
export const canReviewProduct = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/can-review`
    );

    return response.data;
};


// =========================================================
// LẤY REVIEW CỦA CHÍNH KHÁCH HÀNG
// CUSTOMER
// =========================================================
export const getMyReview = async (productId) => {
    const response = await api.get(
        `/reviews/product/${productId}/my-review`
    );

    return response.data;
};


// =========================================================
// TẠO REVIEW
// CUSTOMER
// =========================================================
export const createReview = async (
    productId,
    rating,
    comment
) => {
    const response = await api.post(
        `/reviews/product/${productId}`,
        {
            rating,
            comment
        }
    );

    return response.data;
};


// =========================================================
// CẬP NHẬT REVIEW
// CUSTOMER
// =========================================================
export const updateReview = async (
    productId,
    rating,
    comment
) => {
    const response = await api.put(
        `/reviews/product/${productId}`,
        {
            rating,
            comment
        }
    );

    return response.data;
};


// =========================================================
// UPLOAD ẢNH / VIDEO REVIEW
// CUSTOMER
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
// XÓA ẢNH / VIDEO REVIEW
// CUSTOMER
// =========================================================
export const deleteReviewMedia = async (mediaId) => {
    const response = await api.delete(
        `/reviews/media/${mediaId}`
    );

    return response.data;
};