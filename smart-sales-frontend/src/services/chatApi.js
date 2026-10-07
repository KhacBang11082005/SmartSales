import api from "./api";

// =========================================================
// CHAT - CUSTOMER
// =========================================================

// =========================================================
// TẠO CUỘC TRÒ CHUYỆN
//
// productId:
// - Có thể truyền khi khách đang xem sản phẩm.
// - Có thể để null khi khách chat từ trang khác.
//
// message:
// - Tin nhắn đầu tiên của khách hàng.
// =========================================================

export const createConversation = async (
    productId = null,
    message = ""
) => {

    const response = await api.post(
        "/chat/conversations",
        {
            productId,
            message
        }
    );

    return response.data;
};


// =========================================================
// LẤY CUỘC TRÒ CHUYỆN HIỆN TẠI
//
// Dùng cho CustomerChatWidget.
//
// Backend sẽ trả về cuộc trò chuyện WAITING / ASSIGNED / ACTIVE
// gần nhất của customer.
// =========================================================

export const getCurrentConversation = async () => {

    const response = await api.get(
        "/chat/conversations/current"
    );

    return response.data;
};


// =========================================================
// LẤY LỊCH SỬ CUỘC TRÒ CHUYỆN CỦA CUSTOMER
// =========================================================

export const getMyConversations = async () => {

    const response = await api.get(
        "/chat/conversations/my"
    );

    return response.data;
};


// =========================================================
// CHAT - STAFF / EMPLOYEE
// =========================================================

// =========================================================
// LẤY INBOX CSKH
//
// Bao gồm:
// - WAITING
// - ASSIGNED
// - ACTIVE
//
// Dùng cho Staff Chat Inbox.
// =========================================================

export const getStaffInbox = async () => {

    const response = await api.get(
        "/chat/staff/inbox"
    );

    return response.data;
};


// =========================================================
// LẤY CHI TIẾT CUỘC TRÒ CHUYỆN CỦA STAFF
// =========================================================

export const getStaffConversation = async (
    conversationId
) => {

    const response = await api.get(
        `/chat/staff/conversations/${conversationId}`
    );

    return response.data;
};


// =========================================================
// STAFF TIẾP NHẬN CUỘC TRÒ CHUYỆN
//
// WAITING / ASSIGNED
//        ↓
//      ACTIVE
// =========================================================

export const acceptConversation = async (
    conversationId
) => {

    const response = await api.post(
        `/chat/staff/conversations/${conversationId}/accept`
);

return response.data;
};


// =========================================================
// CHAT MESSAGE
// =========================================================

// =========================================================
// LẤY DANH SÁCH TIN NHẮN
// =========================================================

export const getMessages = async (
    conversationId
) => {

    const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
    );

    return response.data;
};


// =========================================================
// GỬI TIN NHẮN
// =========================================================

export const sendMessage = async (
    conversationId,
    content
) => {

    const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
            content
        }
    );

    return response.data;
};


// =========================================================
// ĐÓNG CUỘC TRÒ CHUYỆN
//
// ACTIVE
//   ↓
// CLOSED
// =========================================================

export const closeConversation = async (
    conversationId
) => {

    const response = await api.post(
        `/chat/conversations/${conversationId}/close`
    );

    return response.data;
};


// =========================================================
// STAFF PRESENCE / HEARTBEAT
//
// StaffLayout sẽ gọi API này định kỳ.
//
// Backend dùng lastSeenAt để xác định:
// - Online: heartbeat trong vòng 30 giây
// - Offline: quá 30 giây không heartbeat
// =========================================================

export const updateStaffPresence = async () => {

    const response = await api.post(
        "/chat/staff/presence"
    );

    return response.data;
};

