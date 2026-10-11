
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    MessageCircle,
    Send,
    Headphones,
    X,
    Bot
} from "lucide-react";

import {
    createConversation,
    getCurrentConversation,
    getMessages,
    sendMessage,
    closeConversation,
    askSmartSalesAI
} from "../../services/chatApi";

import "./CustomerChatWidget.css";

function CustomerChatWidget() {
    const { user } = useAuth();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [aiMessages, setAiMessages] = useState([]);

    // AI là chế độ mặc định. Không hiển thị nút chuyển chế độ.
    const [chatMode, setChatMode] = useState("AI");

    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);

    const visibleMessages =
        chatMode === "AI" ? aiMessages : messages;

    // Lấy product ID nếu đang ở trang chi tiết sản phẩm.
    const getProductIdFromUrl = useCallback(() => {
        const match = location.pathname.match(/\/products\/(\d+)/);
        return match ? Number(match[1]) : null;
    }, [location.pathname]);

    // Nhận diện yêu cầu gặp nhân viên.
    const isHumanSupportRequest = useCallback((content) => {
        const normalized = content
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[.,!?;:]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const patterns = [
            /\b(nhan vien|nhan vien tu van|nhan vien ho tro)\b/,
            /\b(gap nguoi that|noi chuyen voi nguoi that)\b/,
            /\b(ket noi|chuyen|noi chuyen|gap|tu van|ho tro)\b.{0,35}\b(nhan vien|tu van vien|nguoi that)\b/,
            /\b(cho toi gap|toi muon gap|toi can gap)\b/,
            /\b(goi dien|lien he)\b.{0,25}\b(nhan vien|tu van vien)\b/
        ];

        return patterns.some((pattern) => pattern.test(normalized));
    }, []);

    // Tải tin nhắn của cuộc trò chuyện với nhân viên.
    const loadMessages = useCallback(async (
        conversationId,
        showLoading = true
    ) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const data = await getMessages(conversationId);

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Không thể tải tin nhắn:", err);

            if (showLoading) {
                setError("Không thể tải tin nhắn.");
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    // Tải cuộc trò chuyện hiện tại.
    // active() giúp tránh cập nhật state sau khi effect đã được dọn dẹp.
    const loadCurrentConversation = useCallback(async (active) => {
        try {
            if (active()) {
                setLoading(true);
                setError("");
            }

            const data = await getCurrentConversation();

            if (!active()) return;

            const currentConversation = data || null;
            setConversation(currentConversation);

            if (currentConversation?.id) {
                const messageData = await getMessages(
                    currentConversation.id
                );

                if (!active()) return;

                setMessages(
                    Array.isArray(messageData) ? messageData : []
                );

                setChatMode(
                    currentConversation.status === "CLOSED"
                        ? "AI"
                        : "STAFF"
                );
            } else {
                setMessages([]);
                setChatMode("AI");
            }
        } catch (err) {
            if (!active()) return;

            console.error(
                "Không thể tải cuộc trò chuyện hiện tại:",
                err
            );

            setError(
                "Không thể kết nối với hệ thống hỗ trợ."
            );
        } finally {
            if (active()) {
                setLoading(false);
            }
        }
    }, []);

    // Đóng cửa sổ khi nhấn ra ngoài.
    useEffect(() => {
        if (!open) return undefined;

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

    // Cuộn xuống tin nhắn mới nhất.
    useEffect(() => {
        if (!open) return;

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [visibleMessages, open, loading, sending]);

    // Khi mở chat, tải hội thoại hiện có.
    useEffect(() => {
        if (!open || !user?.id) {
            return undefined;
        }

        let isActive = true;

        // Hoãn lời gọi sang microtask để tránh gọi hàm cập nhật state
        // đồng bộ ngay trong quá trình chạy effect.
        void Promise.resolve().then(() => {
            if (isActive) {
                return loadCurrentConversation(
                    () => isActive
                );
            }

            return undefined;
        }).catch((err) => {
            if (isActive) {
                console.error(
                    "Lỗi tải cuộc trò chuyện:",
                    err
                );
            }
        });

        return () => {
            isActive = false;
        };
    }, [open, user?.id, loadCurrentConversation]);

    // Polling tin nhắn nhân viên mỗi 2 giây.
    useEffect(() => {
        if (
            !open ||
            chatMode !== "STAFF" ||
            !conversation?.id ||
            conversation.status === "CLOSED"
        ) {
            return undefined;
        }

        let isActive = true;

        const interval = setInterval(() => {
            if (isActive) {
                void loadMessages(
                    conversation.id,
                    false
                ).catch((err) => {
                    console.error(
                        "Lỗi cập nhật tin nhắn:",
                        err
                    );
                });
            }
        }, 2000);

        return () => {
            isActive = false;
            clearInterval(interval);
        };
    }, [
        open,
        chatMode,
        conversation?.id,
        conversation?.status,
        loadMessages
    ]);

    // Gửi câu hỏi cho AI.
    const handleSendAIMessage = async (content) => {
        if (!user) {
            setError(
                "Vui lòng đăng nhập tài khoản khách hàng để sử dụng AI tư vấn."
            );
            return;
        }

        const userMessage = {
            id: `user-${Date.now()}`,
            content,
            sentAt: new Date().toISOString(),
            sender: "customer"
        };

        setAiMessages((previous) => [
            ...previous,
            userMessage
        ]);

        setMessageInput("");
        setSending(true);
        setError("");

        try {
            const data = await askSmartSalesAI(content);

            if (!data?.reply) {
                throw new Error(
                    "AI không trả về nội dung phản hồi."
                );
            }

            setAiMessages((previous) => [
                ...previous,
                {
                    id: `ai-${Date.now()}`,
                    content: data.reply,
                    sentAt: new Date().toISOString(),
                    sender: "ai"
                }
            ]);
        } catch (err) {
            console.error(
                "Không thể gửi tin nhắn cho AI:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "AI chưa thể trả lời. Vui lòng thử lại sau."
            );

            setMessageInput(content);

            setAiMessages((previous) =>
                previous.filter(
                    (message) => message.id !== userMessage.id
                )
            );
        } finally {
            setSending(false);
        }
    };

    // Chuyển sang nhân viên.
    const handleTransferToStaff = async (content) => {
        if (!user) {
            setError(
                "Vui lòng đăng nhập tài khoản khách hàng để được nhân viên hỗ trợ."
            );
            return;
        }

        setSending(true);
        setError("");

        try {
            let currentConversation = conversation;

            if (
                !currentConversation?.id ||
                currentConversation.status === "CLOSED"
            ) {
                const productId = getProductIdFromUrl();

                currentConversation = await createConversation(
                    productId,
                    content
                );

                setConversation(currentConversation);
            } else {
                await sendMessage(
                    currentConversation.id,
                    content
                );
            }

            setChatMode("STAFF");
            setMessageInput("");

            if (currentConversation?.id) {
                await loadMessages(
                    currentConversation.id,
                    false
                );
            }
        } catch (err) {
            console.error(
                "Không thể chuyển sang nhân viên:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Chưa thể kết nối nhân viên. Vui lòng thử lại."
            );

            setMessageInput(content);
        } finally {
            setSending(false);
        }
    };

    // Gửi tin nhắn theo chế độ đang hoạt động.
    const handleSendMessage = async () => {
        const content = messageInput.trim();

        if (!content || sending) return;

        if (!user) {
            setError(
                "Vui lòng đăng nhập tài khoản khách hàng để sử dụng khung chat."
            );
            return;
        }

        // Đang trao đổi với nhân viên.
        if (chatMode === "STAFF") {
            if (
                !conversation?.id ||
                conversation.status === "CLOSED"
            ) {
                setError(
                    "Cuộc trò chuyện đã kết thúc. Vui lòng gửi yêu cầu hỗ trợ mới."
                );
                return;
            }

            setSending(true);
            setError("");

            try {
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

            return;
        }

        // Khách yêu cầu nhân viên: không gọi AI.
        if (isHumanSupportRequest(content)) {
            await handleTransferToStaff(content);
            return;
        }

        // Câu hỏi thông thường: AI tự động tư vấn.
        await handleSendAIMessage(content);
    };

    // Enter để gửi tin nhắn.
    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            void handleSendMessage();
        }
    };

    // Kết thúc hội thoại nhân viên.
    const handleCloseConversation = async () => {
        if (!conversation?.id) return;

        try {
            await closeConversation(conversation.id);

            setConversation((previous) =>
                previous
                    ? {
                        ...previous,
                        status: "CLOSED"
                    }
                    : null
            );

            setChatMode("AI");
            setError("");
        } catch (err) {
            console.error(
                "Không thể đóng cuộc trò chuyện:",
                err
            );

            setError(
                "Không thể kết thúc cuộc trò chuyện."
            );
        }
    };

    // Định dạng thời gian.
    const formatMessageTime = (value) => {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Kiểm tra tin nhắn của khách.
    const isCustomerMessage = (message) => {
        const senderId = message?.senderId;
        const currentUserId = user?.id;

        return (
            senderId != null &&
            currentUserId != null &&
            Number(senderId) === Number(currentUserId)
        );
    };

    return (
        <div
            ref={chatRef}
            className="customer-chat-widget-wrapper"
        >
            {/* Nút mở/đóng chat */}
            <button
                type="button"
                className="customer-chat-button"
                onClick={() => setOpen((previous) => !previous)}
                aria-label={
                    open
                        ? "Đóng hỗ trợ khách hàng"
                        : "Mở hỗ trợ khách hàng"
                }
            >
                {open ? (
                    <X size={25} />
                ) : (
                    <MessageCircle size={25} />
                )}
            </button>

            {open && (
                <div className="customer-chat-window">
                    {/* HEADER */}
                    <div className="customer-chat-header">
                        <div className="customer-chat-header-info">
                            <div className="customer-chat-avatar">
                                {chatMode === "AI" ? (
                                    <Bot size={20} />
                                ) : (
                                    <Headphones size={20} />
                                )}
                            </div>

                            <div className="customer-chat-title">
                                <strong>
                                    {chatMode === "AI"
                                        ? "Tư vấn SmartSales"
                                        : "Hỗ trợ khách hàng"}
                                </strong>

                                <div className="customer-chat-status">
                                    <span className="customer-chat-status-dot" />

                                    {chatMode === "AI"
                                        ? "Trợ lý AI trực tuyến"
                                        : conversation?.status === "CLOSED"
                                            ? "Đã kết thúc"
                                            : "Hỗ trợ nhân viên"}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="customer-chat-close"
                            onClick={() => setOpen(false)}
                            aria-label="Đóng cửa sổ chat"
                        >
                            <X size={19} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="customer-chat-body">
                        {loading &&
                            chatMode === "STAFF" &&
                            messages.length === 0 && (
                                <div className="customer-chat-loading">
                                    Đang tải...
                                </div>
                            )}

                        {visibleMessages.length === 0 &&
                            !(chatMode === "STAFF" && loading) && (
                                <div className="customer-chat-welcome">
                                    <div className="customer-chat-welcome-icon">
                                        {chatMode === "AI" ? (
                                            <Bot size={16} />
                                        ) : (
                                            <MessageCircle size={16} />
                                        )}
                                    </div>

                                    <div className="customer-chat-welcome-content">
                                        <strong>Xin chào! 👋</strong>

                                        {chatMode === "AI" ? (
                                            <>
                                                <p>
                                                    Mình là trợ lý tư vấn
                                                    SmartSales. Bạn có thể hỏi
                                                    về sản phẩm, giá bán và lựa
                                                    chọn thiết bị phù hợp.
                                                </p>

                                                <p>
                                                    Nếu cần nhân viên hỗ trợ,
                                                    hãy nhắn “Tôi muốn gặp
                                                    nhân viên”.
                                                </p>

                                                {!user && (
                                                    <p>
                                                        Vui lòng đăng nhập để
                                                        sử dụng chức năng chat.
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p>
                                                Nhân viên hỗ trợ sẽ tiếp nhận
                                                yêu cầu của bạn tại đây.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                        {error && (
                            <div className="customer-chat-error">
                                {error}
                            </div>
                        )}

                        {visibleMessages.map((message) => {
                            const isCustomer =
                                chatMode === "AI"
                                    ? message.sender === "customer"
                                    : isCustomerMessage(message);

                            return (
                                <div
                                    key={message.id}
                                    className={`customer-chat-message ${
                                        isCustomer
                                            ? "customer"
                                            : "staff"
                                    }`}
                                >
                                    <div>
                                        {chatMode === "AI" &&
                                            !isCustomer && (
                                                <div className="customer-chat-sender-label">
                                                    AI SmartSales
                                                </div>
                                            )}

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
                        })}

                        {chatMode === "AI" && sending && (
                            <div className="customer-chat-message staff">
                                <div>
                                    <div className="customer-chat-sender-label">
                                        AI SmartSales
                                    </div>

                                    <div className="customer-chat-message-bubble">
                                        AI đang trả lời...
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* FOOTER */}
                    <div className="customer-chat-footer">
                        {chatMode === "STAFF" &&
                        conversation?.status === "CLOSED" ? (
                            <div className="customer-chat-closed-message">
                                Cuộc trò chuyện đã kết thúc.
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    className="customer-chat-input"
                                    placeholder={
                                        !user
                                            ? "Đăng nhập để sử dụng chat..."
                                            : chatMode === "AI"
                                                ? "Hỏi về sản phẩm hoặc yêu cầu nhân viên..."
                                                : "Nhập tin nhắn..."
                                    }
                                    value={messageInput}
                                    onChange={(event) =>
                                        setMessageInput(event.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    disabled={sending || !user}
                                />

                                <button
                                    type="button"
                                    className="customer-chat-send"
                                    onClick={() => {
                                        void handleSendMessage();
                                    }}
                                    disabled={
                                        sending ||
                                        !messageInput.trim() ||
                                        !user
                                    }
                                    aria-label="Gửi tin nhắn"
                                >
                                    <Send size={18} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Kết thúc hội thoại nhân viên */}
                    {chatMode === "STAFF" &&
                        conversation &&
                        conversation.status !== "CLOSED" && (
                            <button
                                type="button"
                                className="customer-chat-end"
                                onClick={() => {
                                    void handleCloseConversation();
                                }}
                            >
                                Kết thúc cuộc trò chuyện
                            </button>
                        )}
                </div>
            )}
        </div>
    );
}

export default CustomerChatWidget;
