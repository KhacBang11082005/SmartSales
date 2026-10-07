import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    MessageCircle,
    Send,
    Headphones,
    X
} from "lucide-react";

import {
    createConversation,
    getCurrentConversation,
    getMessages,
    sendMessage,
    closeConversation
} from "../../services/chatApi";

import "./CustomerChatWidget.css";


function CustomerChatWidget() {

    // =========================================================
    // UI
    // =========================================================

    const [open, setOpen] = useState(false);

    const [messageInput, setMessageInput] = useState("");

    const [messages, setMessages] = useState([]);

    const [conversation, setConversation] = useState(null);

    const [loading, setLoading] = useState(false);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");

    const chatRef = useRef(null);

    const messagesEndRef = useRef(null);

    const location = useLocation();


    // =========================================================
    // LẤY PRODUCT ID NẾU ĐANG Ở TRANG PRODUCT DETAIL
    //
    // Ví dụ:
    // /products/10
    //
    // => productId = 10
    // =========================================================

    const getProductIdFromUrl = () => {

        const match = location.pathname.match(
            /\/products\/(\d+)/
        );

        if (!match) {
            return null;
        }

        return Number(match[1]);
    };


    // =========================================================
    // CLICK RA NGOÀI CHAT -> ĐÓNG
    // =========================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        const handleClickOutside = (event) => {

            if (
                chatRef.current &&
                !chatRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, [open]);


    // =========================================================
    // CUỘN XUỐNG TIN NHẮN CUỐI
    // =========================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, open]);


    // =========================================================
    // KHI MỞ CHAT
    //
    // Tải conversation hiện tại
    // =========================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        loadCurrentConversation();

    }, [open]);


    // =========================================================
    // POLLING TIN NHẮN
    //
    // Cứ khoảng 2 giây lấy tin nhắn mới
    // =========================================================

    useEffect(() => {

        if (
            !open ||
            !conversation?.id ||
            conversation.status === "CLOSED"
        ) {
            return;
        }

        const interval = setInterval(() => {

            loadMessages(
                conversation.id,
                false
            );

        }, 2000);

        return () => {
            clearInterval(interval);
        };

    }, [
        open,
        conversation?.id,
        conversation?.status
    ]);


    // =========================================================
    // LOAD CONVERSATION HIỆN TẠI
    // =========================================================

    const loadCurrentConversation = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getCurrentConversation();

            setConversation(data || null);

            if (data?.id) {

                await loadMessages(
                    data.id,
                    false
                );

            } else {

                setMessages([]);

            }

        } catch (err) {

            console.error(
                "Không thể tải conversation:",
                err
            );

            setError(
                "Không thể kết nối với hệ thống hỗ trợ."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // LOAD MESSAGES
    // =========================================================

    const loadMessages = async (
        conversationId,
        showLoading = true
    ) => {

        try {

            if (showLoading) {
                setLoading(true);
            }

            const data =
                await getMessages(
                    conversationId
                );

            setMessages(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Không thể tải tin nhắn:",
                err
            );

            if (showLoading) {

                setError(
                    "Không thể tải tin nhắn."
                );

            }

        } finally {

            if (showLoading) {
                setLoading(false);
            }

        }

    };


    // =========================================================
    // GỬI TIN NHẮN
    // =========================================================

    const handleSendMessage = async () => {

        const content =
            messageInput.trim();

        if (
            !content ||
            sending
        ) {
            return;
        }

        try {

            setSending(true);
            setError("");

            // -------------------------------------------------
            // CHƯA CÓ CONVERSATION
            // -> TẠO MỚI
            // -------------------------------------------------

            if (!conversation?.id) {

                const productId =
                    getProductIdFromUrl();

                const newConversation =
                    await createConversation(
                        productId,
                        content
                    );

                setConversation(
                    newConversation
                );

                setMessageInput("");

                // Backend đã lưu message đầu tiên
                await loadMessages(
                    newConversation.id,
                    false
                );

                return;
            }


            // -------------------------------------------------
            // CONVERSATION ĐÃ TỒN TẠI
            // -------------------------------------------------

            if (
                conversation.status === "CLOSED"
            ) {

                setError(
                    "Cuộc trò chuyện đã kết thúc. Vui lòng tạo yêu cầu hỗ trợ mới."
                );

                return;
            }


            await sendMessage(
                conversation.id,
                content
            );

            setMessageInput("");

            await loadMessages(
                conversation.id,
                false
            );

        } catch (err) {

            console.error(
                "Không thể gửi tin nhắn:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Không thể gửi tin nhắn. Vui lòng thử lại."
            );

        } finally {

            setSending(false);

        }

    };


    // =========================================================
    // NHẤN ENTER ĐỂ GỬI
    // =========================================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSendMessage();

        }

    };


    // =========================================================
    // ĐÓNG CUỘC TRÒ CHUYỆN
    // =========================================================

    const handleCloseConversation = async () => {

        if (!conversation?.id) {
            return;
        }

        try {

            await closeConversation(
                conversation.id
            );

            setConversation(
                prev =>
                    prev
                        ? {
                            ...prev,
                            status: "CLOSED"
                        }
                        : null
            );

        } catch (err) {

            console.error(
                "Không thể đóng conversation:",
                err
            );

            setError(
                "Không thể kết thúc cuộc trò chuyện."
            );

        }

    };


    // =========================================================
    // FORMAT THỜI GIAN
    // =========================================================

    const formatMessageTime = (
        value
    ) => {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return date.toLocaleTimeString(
            "vi-VN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================================================
    // KIỂM TRA MESSAGE CỦA CUSTOMER
    // =========================================================

    const isCustomerMessage = (
        message
    ) => {

        const senderId =
            message?.senderId;

        const customerId =
            conversation?.customerId;

        return (
            senderId != null &&
            customerId != null &&
            Number(senderId) ===
            Number(customerId)
        );

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <>
            <div
                ref={chatRef}
                className="customer-chat-widget-wrapper"
            >

                {/* =================================================
                    FLOATING BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="customer-chat-button"
                    onClick={() =>
                        setOpen(
                            prev => !prev
                        )
                    }
                    aria-label={
                        open
                            ? "Đóng hỗ trợ khách hàng"
                            : "Mở hỗ trợ khách hàng"
                    }
                >

                    {open ? (
                        <X size={25} />
                    ) : (
                        <MessageCircle
                            size={25}
                        />
                    )}

                </button>


                {/* =================================================
                    CHAT WINDOW
                ================================================= */}

                {open && (

                    <div className="customer-chat-window">

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="customer-chat-header">

                            <div className="customer-chat-header-info">

                                <div className="customer-chat-avatar">
                                    <Headphones
                                        size={20}
                                    />
                                </div>

                                <div className="customer-chat-title">

                                    <strong>
                                        Hỗ trợ khách hàng
                                    </strong>

                                    <div className="customer-chat-status">

                                        <span className="customer-chat-status-dot" />

                                        {conversation?.status ===
                                        "CLOSED"
                                            ? "Đã kết thúc"
                                            : "Đang trực tuyến"}

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="customer-chat-close"
                                onClick={() =>
                                    setOpen(false)
                                }
                                aria-label="Đóng cửa sổ chat"
                            >
                                <X size={19} />
                            </button>

                        </div>


                        {/* =================================================
                            BODY
                        ================================================= */}

                        <div className="customer-chat-body">

                            {/* LOADING */}

                            {loading &&
                                messages.length === 0 && (

                                    <div className="customer-chat-loading">
                                        Đang tải...
                                    </div>

                                )}


                            {/* WELCOME */}

                            {!loading &&
                                messages.length === 0 && (

                                    <div className="customer-chat-welcome">

                                        <div className="customer-chat-welcome-icon">

                                            <MessageCircle
                                                size={16}
                                            />

                                        </div>

                                        <div className="customer-chat-welcome-content">

                                            <strong>
                                                Xin chào! 👋
                                            </strong>

                                            SmartSales luôn
                                            sẵn sàng hỗ trợ
                                            bạn về sản phẩm,
                                            đơn hàng và các
                                            vấn đề trong quá
                                            trình mua hàng.

                                            <br />

                                            Hãy nhập tin nhắn
                                            bên dưới để bắt
                                            đầu trò chuyện.

                                        </div>

                                    </div>

                                )}


                            {/* ERROR */}

                            {error && (

                                <div className="customer-chat-error">
                                    {error}
                                </div>

                            )}


                            {/* MESSAGES */}

                            {messages.map(
                                message => {

                                    const isCustomer =
                                        isCustomerMessage(
                                            message
                                        );

                                    return (

                                        <div
                                            key={
                                                message.id
                                            }
                                            className={
                                                `customer-chat-message ${
                                                    isCustomer
                                                        ? "customer"
                                                        : "staff"
                                                }`
                                            }
                                        >

                                            <div>

                                                <div className="customer-chat-message-bubble">

                                                    {message.content}

                                                </div>

                                                <div className="customer-chat-message-time">

                                                    {formatMessageTime(
                                                        message.sentAt
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}


                            {/* PRODUCT CONTEXT */}

                            {conversation?.productName && (
                                <div className="customer-chat-product-context">

                                    <span>
                                        Đang hỗ trợ sản phẩm:
                                    </span>

                                    <strong>
                                        {conversation.productName}
                                    </strong>

                                </div>
                            )}


                            <div
                                ref={messagesEndRef}
                            />

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="customer-chat-footer">

                            {conversation?.status ===
                            "CLOSED" ? (

                                <div className="customer-chat-closed-message">

                                    Cuộc trò chuyện đã kết thúc.

                                </div>

                            ) : (

                                <>

                                    <input
                                        type="text"
                                        className="customer-chat-input"
                                        placeholder="Nhập tin nhắn..."
                                        value={
                                            messageInput
                                        }
                                        onChange={event =>
                                            setMessageInput(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        disabled={
                                            sending
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="customer-chat-send"
                                        onClick={
                                            handleSendMessage
                                        }
                                        disabled={
                                            sending ||
                                            !messageInput.trim()
                                        }
                                        aria-label="Gửi tin nhắn"
                                    >

                                        <Send
                                            size={18}
                                        />

                                    </button>

                                </>

                            )}

                        </div>


                        {/* =================================================
                            CLOSE CONVERSATION
                        ================================================= */}

                        {conversation &&
                            conversation.status !==
                            "CLOSED" && (

                                <button
                                    type="button"
                                    className="customer-chat-end"
                                    onClick={
                                        handleCloseConversation
                                    }
                                >
                                    Kết thúc cuộc trò chuyện
                                </button>

                            )}

                    </div>

                )}

            </div>
        </>
    );
}


export default CustomerChatWidget;