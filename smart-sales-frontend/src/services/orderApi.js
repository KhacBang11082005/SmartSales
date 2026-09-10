import api from "./api";


// ==========================================
// LẤY DANH SÁCH ĐƠN HÀNG CỦA CUSTOMER
// ==========================================

export const getMyOrders = async () => {

    const token = localStorage.getItem("token");

    if (!token) {

        throw new Error("Bạn chưa đăng nhập");

    }


    const response = await api.get(
        "/orders",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );


    return response.data;

};


// ==========================================
// LẤY CHI TIẾT ĐƠN HÀNG
// ==========================================

export const getOrderById = async (id) => {

    const token = localStorage.getItem("token");

    if (!token) {

        throw new Error("Bạn chưa đăng nhập");

    }


    const response = await api.get(
        `/orders/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );


    return response.data;

};


// ==========================================
// LẤY CÁC SẢN PHẨM TRONG ĐƠN HÀNG
// ==========================================

export const getOrderDetails = async (orderId) => {

    const token = localStorage.getItem("token");

    if (!token) {

        throw new Error("Bạn chưa đăng nhập");

    }


    const response = await api.get(
        `/order-details/order/${orderId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );


    return response.data;

};


// ==========================================
// TẠO ĐƠN HÀNG
// ==========================================

export const createOrder = async (orderData) => {

    const token = localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
        );

    }


    const response = await api.post(

        "/orders",

        orderData,

        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

    );


    return response.data;

};


// ==========================================
// CẬP NHẬT THÔNG TIN GIAO HÀNG
// ==========================================

export const updateShippingInformation = async (

    orderId,

    shippingData

) => {

    const token = localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
        );

    }


    const response = await api.put(

        `/orders/${orderId}/shipping`,

        shippingData,

        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

    );


    return response.data;

};


// ==========================================
// HỦY ĐƠN HÀNG
// ==========================================

export const cancelOrder = async (id) => {

    const token = localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập"
        );

    }


    const response = await api.patch(

        `/orders/${id}/cancel`,

        {},

        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

    );


    return response.data;

};

// ==========================================
// ADMIN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
// ==========================================

export const updateOrderStatus = async (id, status) => {

    // Lấy token của tài khoản đang đăng nhập
    const token = localStorage.getItem("token");

    // Nếu chưa đăng nhập thì không cho gọi API
    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập"
        );

    }

    // Gọi API PATCH đến backend
    //
    // Ví dụ:
    // id = 10
    // status = "CONFIRMED"
    //
    // Request sẽ gửi:
    // PATCH /orders/10/status
    // Body: { status: "CONFIRMED" }

    const response = await api.patch(

        `/orders/${id}/status`,

        {
            status: status,
        },

        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

    );

    // Trả về đơn hàng sau khi backend cập nhật thành công
    return response.data;

};