import {
    Search,
    Send,
    MessageCircle,
    UserRound,
    Package,
    CheckCircle2,
    Clock3,
    XCircle,
    Headphones,
    Check
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    getStaffInbox,
    getStaffConversation,
    acceptConversation,
    getMessages,
    sendMessage,
    closeConversation
} from "../../services/chatApi";

import "./StaffChat.css";


function StaffChat() {

    // =====================================================
    // STATE
    // =====================================================

    const [conversations, setConversations] =
        useState([]);

    const [selectedConversation, setSelectedConversation] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [messageInput, setMessageInput] =
        useState("");

    const [searchText, setSearchText] =
        useState("");

    const [loadingInbox, setLoadingInbox] =
        useState(true);

    const [loadingConversation, setLoadingConversation] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [accepting, setAccepting] =
        useState(false);

    const [closing, setClosing] =
        useState(false);

    const [error, setError] =
        useState("");

    const messagesEndRef =
        useRef(null);


    // =====================================================
    // LOAD INBOX
    // =====================================================

    const loadInbox = async (
        showLoading = false
    ) => {

        try {

            if (showLoading) {
                setLoadingInbox(true);
            }

            const data =
                await getStaffInbox();

            const list =
                Array.isArray(data)
                    ? data
                    : [];

            setConversations(list);

            // ---------------------------------------------
            // Cập nhật conversation đang được chọn
            // ---------------------------------------------

            if (selectedConversation?.id) {

                const updated =
                    list.find(
                        (item) =>
                            Number(item.id) ===
                            Number(selectedConversation.id)
                    );

                if (updated) {

                    setSelectedConversation(
                        (previous) => ({
                            ...previous,
                            ...updated
                        })
                    );

                }

            }

        } catch (err) {

            console.error(
                "STAFF CHAT INBOX ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Không thể tải danh sách hỗ trợ."
            );

        } finally {

            if (showLoading) {
                setLoadingInbox(false);
            }

        }

    };


    // =====================================================
    // LOAD MESSAGES
    // =====================================================

    const loadMessages = async (
        conversationId,
        showLoading = false
    ) => {

        if (!conversationId) {
            return;
        }

        try {

            if (showLoading) {
                setLoadingConversation(true);
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
                "STAFF CHAT MESSAGE ERROR:",
                err
            );

            if (showLoading) {

                setError(
                    err?.response?.data?.message ||
                    "Không thể tải tin nhắn."
                );

            }

        } finally {

            if (showLoading) {
                setLoadingConversation(false);
            }

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadInbox(true);

    }, []);


    // =====================================================
    // POLLING INBOX
    //
    // 3 GIÂY
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                loadInbox(false);

            }, 3000);

        return () => {

            clearInterval(interval);

        };

    }, [selectedConversation?.id]);


    // =====================================================
    // POLLING MESSAGE
    //
    // 2 GIÂY
    // =====================================================

    useEffect(() => {

        if (
            !selectedConversation?.id ||
            selectedConversation.status === "CLOSED"
        ) {
            return;
        }

        const interval =
            setInterval(() => {

                loadMessages(
                    selectedConversation.id,
                    false
                );

            }, 2000);

        return () => {

            clearInterval(interval);

        };

    }, [
        selectedConversation?.id,
        selectedConversation?.status
    ]);


    // =====================================================
    // AUTO SCROLL MESSAGE
    // =====================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // =====================================================
    // CHỌN CONVERSATION
    // =====================================================

    const handleSelectConversation =
        async (conversation) => {

            if (!conversation?.id) {
                return;
            }

            try {

                setError("");

                setSelectedConversation(
                    conversation
                );

                setMessages([]);

                setMessageInput("");

                await getStaffConversation(
                    conversation.id
                );

                await loadMessages(
                    conversation.id,
                    true
                );

            } catch (err) {

                console.error(
                    "STAFF CHAT SELECT ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Không thể tải cuộc trò chuyện."
                );

            }

        };


    // =====================================================
    // TIẾP NHẬN
    // =====================================================

    const handleAcceptConversation =
        async () => {

            if (
                !selectedConversation?.id ||
                accepting
            ) {
                return;
            }

            try {

                setAccepting(true);

                setError("");

                const updated =
                    await acceptConversation(
                        selectedConversation.id
                    );

                setSelectedConversation(
                    updated
                );

                await loadInbox(false);

                await loadMessages(
                    selectedConversation.id,
                    false
                );

            } catch (err) {

                console.error(
                    "ACCEPT CHAT ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Không thể tiếp nhận cuộc trò chuyện."
                );

            } finally {

                setAccepting(false);

            }

        };


    // =====================================================
    // GỬI TIN NHẮN
    // =====================================================

    const handleSendMessage =
        async () => {

            const content =
                messageInput.trim();

            if (
                !content ||
                sending ||
                !selectedConversation?.id
            ) {
                return;
            }

            if (
                selectedConversation.status !==
                "ACTIVE"
            ) {

                setError(
                    "Bạn cần tiếp nhận cuộc trò chuyện trước khi nhắn tin."
                );

                return;

            }

            try {

                setSending(true);

                setError("");

                await sendMessage(
                    selectedConversation.id,
                    content
                );

                setMessageInput("");

                await loadMessages(
                    selectedConversation.id,
                    false
                );

                await loadInbox(false);

            } catch (err) {

                console.error(
                    "STAFF SEND MESSAGE ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Không thể gửi tin nhắn."
                );

            } finally {

                setSending(false);

            }

        };


    // =====================================================
    // ENTER GỬI
    // =====================================================

    const handleKeyDown =
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                handleSendMessage();

            }

        };


    // =====================================================
    // KẾT THÚC CUỘC TRÒ CHUYỆN
    // =====================================================

    const handleCloseConversation =
        async () => {

            if (
                !selectedConversation?.id ||
                closing
            ) {
                return;
            }

            try {

                setClosing(true);

                setError("");

                await closeConversation(
                    selectedConversation.id
                );

                setSelectedConversation(
                    (previous) => {

                        if (!previous) {
                            return previous;
                        }

                        return {
                            ...previous,
                            status: "CLOSED"
                        };

                    }
                );

                await loadInbox(false);

            } catch (err) {

                console.error(
                    "CLOSE CHAT ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Không thể kết thúc cuộc trò chuyện."
                );

            } finally {

                setClosing(false);

            }

        };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredConversations =
        useMemo(() => {

            const keyword =
                searchText
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return conversations;
            }

            return conversations.filter(
                (conversation) => {

                    const customerName =
                        conversation.customerName ||
                        "";

                    const productName =
                        conversation.productName ||
                        "";

                    return (
                        customerName
                            .toLowerCase()
                            .includes(keyword) ||

                        productName
                            .toLowerCase()
                            .includes(keyword)
                    );

                }
            );

        }, [
            conversations,
            searchText
        ]);


    // =====================================================
    // GROUP CONVERSATIONS
    // =====================================================

    const newRequests =
        filteredConversations.filter(
            (conversation) =>
                conversation.status === "WAITING" ||
                conversation.status === "ASSIGNED"
        );

    const activeConversations =
        filteredConversations.filter(
            (conversation) =>
                conversation.status === "ACTIVE"
        );

    const historyConversations =
        filteredConversations.filter(
            (conversation) =>
                conversation.status === "CLOSED"
        );


    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime =
        (value) => {

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


    // =====================================================
    // STATUS
    // =====================================================

    const getStatusLabel =
        (status) => {

            switch (status) {

                case "WAITING":
                    return "Đang chờ";

                case "ASSIGNED":
                    return "Chờ tiếp nhận";

                case "ACTIVE":
                    return "Đang hỗ trợ";

                case "CLOSED":
                    return "Đã kết thúc";

                default:
                    return status || "";

            }

        };


    // =====================================================
    // RENDER CONVERSATION ITEM
    // =====================================================

    const renderConversation =
        (conversation) => {

            const isSelected =
                Number(
                    selectedConversation?.id
                ) === Number(
                    conversation.id
                );

            const unread =
                Number(
                    conversation.unreadCount || 0
                );

            return (

                <button
                    key={conversation.id}
                    type="button"
                    className={
                        `staff-chat-conversation-item ${
                            isSelected
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        handleSelectConversation(
                            conversation
                        )
                    }
                >

                    <div className="staff-chat-conversation-avatar">
                        <UserRound size={18} />
                    </div>

                    <div className="staff-chat-conversation-content">

                        <div className="staff-chat-conversation-top">

                            <strong>
                                {conversation.customerName ||
                                    "Khách hàng"}
                            </strong>

                            <span>
                                {formatTime(
                                    conversation.lastMessageAt ||
                                    conversation.requestedAt
                                )}
                            </span>

                        </div>

                        <div className="staff-chat-conversation-product">

                            {conversation.productName
                                ? conversation.productName
                                : "Hỗ trợ chung"}

                        </div>

                        <div className="staff-chat-conversation-bottom">

                            <span className="staff-chat-conversation-status">

                                {getStatusLabel(
                                    conversation.status
                                )}

                            </span>

                            {unread > 0 && (

                                <span className="staff-chat-unread">

                                    {unread > 99
                                        ? "99+"
                                        : unread}

                                </span>

                            )}

                        </div>

                    </div>

                </button>

            );

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="staff-chat-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="staff-chat-page-header">

                <div>

                    <div className="staff-chat-brand">
                        SMART SALES
                    </div>

                    <h2>
                        Hỗ trợ khách hàng
                    </h2>

                    <p>
                        Tiếp nhận và hỗ trợ các yêu cầu
                        từ khách hàng.
                    </p>

                </div>

                <div className="staff-chat-online">

                    <span />

                    Đang trực tuyến

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="staff-chat-error">
                    {error}
                </div>

            )}


            {/* =================================================
                CHAT WORKSPACE
            ================================================= */}

            <div className="staff-chat-workspace">


                {/* =================================================
                    LEFT
                ================================================= */}

                <aside className="staff-chat-sidebar">


                    {/* SEARCH */}

                    <div className="staff-chat-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Tìm khách hàng..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {loadingInbox ? (

                        <div className="staff-chat-list-loading">
                            Đang tải yêu cầu...
                        </div>

                    ) : (

                        <div className="staff-chat-list">


                            {/* =================================================
                                YÊU CẦU MỚI
                            ================================================= */}

                            <section>

                                <div className="staff-chat-section-title">

                                    <span>
                                        Yêu cầu mới
                                    </span>

                                    <strong>
                                        {newRequests.length}
                                    </strong>

                                </div>

                                {newRequests.length === 0 ? (

                                    <div className="staff-chat-empty-list">
                                        Không có yêu cầu mới.
                                    </div>

                                ) : (

                                    newRequests.map(
                                        renderConversation
                                    )

                                )}

                            </section>


                            {/* =================================================
                                ĐANG HỖ TRỢ
                            ================================================= */}

                            <section>

                                <div className="staff-chat-section-title">

                                    <span>
                                        Đang hỗ trợ
                                    </span>

                                    <strong>
                                        {activeConversations.length}
                                    </strong>

                                </div>

                                {activeConversations.length === 0 ? (

                                    <div className="staff-chat-empty-list">
                                        Chưa có cuộc trò chuyện.
                                    </div>

                                ) : (

                                    activeConversations.map(
                                        renderConversation
                                    )

                                )}

                            </section>


                            {/* =================================================
                                LỊCH SỬ
                            ================================================= */}

                            <section>

                                <div className="staff-chat-section-title">

                                    <span>
                                        Lịch sử gần đây
                                    </span>

                                    <strong>
                                        {historyConversations.length}
                                    </strong>

                                </div>

                                {historyConversations.length === 0 ? (

                                    <div className="staff-chat-empty-list">
                                        Chưa có lịch sử.
                                    </div>

                                ) : (

                                    historyConversations.map(
                                        renderConversation
                                    )

                                )}

                            </section>

                        </div>

                    )}

                </aside>


                {/* =================================================
                    RIGHT
                ================================================= */}

                <section className="staff-chat-main">

                    {!selectedConversation ? (

                        <div className="staff-chat-no-selection">

                            <div className="staff-chat-no-selection-icon">

                                <MessageCircle size={34} />

                            </div>

                            <h3>
                                Chọn một cuộc trò chuyện
                            </h3>

                            <p>
                                Chọn yêu cầu hỗ trợ ở bên trái
                                để bắt đầu làm việc.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* =================================================
                                CHAT HEADER
                            ================================================= */}

                            <div className="staff-chat-main-header">

                                <div className="staff-chat-main-customer">

                                    <div className="staff-chat-main-avatar">

                                        <UserRound size={20} />

                                    </div>

                                    <div>

                                        <strong>
                                            {selectedConversation.customerName ||
                                                "Khách hàng"}
                                        </strong>

                                        <span>
                                            {getStatusLabel(
                                                selectedConversation.status
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <div className="staff-chat-main-actions">

                                    {(
                                        selectedConversation.status ===
                                        "WAITING" ||
                                        selectedConversation.status ===
                                        "ASSIGNED"
                                    ) && (

                                        <button
                                            type="button"
                                            className="staff-chat-accept-button"
                                            onClick={
                                                handleAcceptConversation
                                            }
                                            disabled={accepting}
                                        >

                                            <Check
                                                size={16}
                                            />

                                            {accepting
                                                ? "Đang tiếp nhận..."
                                                : "TIẾP NHẬN"}

                                        </button>

                                    )}


                                    {selectedConversation.status ===
                                        "ACTIVE" && (

                                            <button
                                                type="button"
                                                className="staff-chat-close-button"
                                                onClick={
                                                    handleCloseConversation
                                                }
                                                disabled={closing}
                                            >

                                                <XCircle
                                                    size={16}
                                                />

                                                {closing
                                                    ? "Đang kết thúc..."
                                                    : "Kết thúc"}

                                            </button>

                                        )}

                                </div>

                            </div>


                            {/* =================================================
                                PRODUCT CONTEXT
                            ================================================= */}

                            {selectedConversation.productName && (

                                <div className="staff-chat-product-context">

                                    <Package size={17} />

                                    <div>

                                        <span>
                                            Sản phẩm khách đang xem
                                        </span>

                                        <strong>
                                            {selectedConversation.productName}
                                        </strong>

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                MESSAGES
                            ================================================= */}

                            <div className="staff-chat-messages">

                                {loadingConversation &&
                                messages.length === 0 ? (

                                    <div className="staff-chat-loading-message">
                                        Đang tải tin nhắn...
                                    </div>

                                ) : messages.length === 0 ? (

                                    <div className="staff-chat-no-messages">

                                        <MessageCircle
                                            size={28}
                                        />

                                        <span>
                                            Chưa có tin nhắn.
                                        </span>

                                    </div>

                                ) : (

                                    messages.map(
                                        (message) => {

                                            const isStaff =
                                                Number(
                                                    message.senderId
                                                ) ===
                                                Number(
                                                    selectedConversation.staffId
                                                );

                                            return (

                                                <div
                                                    key={
                                                        message.id
                                                    }
                                                    className={
                                                        `staff-chat-message ${
                                                            isStaff
                                                                ? "staff"
                                                                : "customer"
                                                        }`
                                                    }
                                                >

                                                    <div className="staff-chat-message-bubble">

                                                        {message.content}

                                                    </div>

                                                    <div className="staff-chat-message-time">

                                                        {formatTime(
                                                            message.sentAt
                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                                <div
                                    ref={
                                        messagesEndRef
                                    }
                                />

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            {selectedConversation.status ===
                            "ACTIVE" ? (

                                <div className="staff-chat-input-area">

                                    <input
                                        type="text"
                                        value={messageInput}
                                        placeholder="Nhập tin nhắn..."
                                        onChange={(event) =>
                                            setMessageInput(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        disabled={sending}
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            handleSendMessage
                                        }
                                        disabled={
                                            sending ||
                                            !messageInput.trim()
                                        }
                                        aria-label="Gửi tin nhắn"
                                    >

                                        <Send size={18} />

                                    </button>

                                </div>

                            ) : selectedConversation.status ===
                            "CLOSED" ? (

                                <div className="staff-chat-closed">

                                    <CheckCircle2 size={17} />

                                    Cuộc trò chuyện đã kết thúc.

                                </div>

                            ) : (

                                <div className="staff-chat-awaiting">

                                    <Clock3 size={17} />

                                    Hãy bấm
                                    <strong>
                                        TIẾP NHẬN
                                    </strong>
                                    để bắt đầu hỗ trợ.

                                </div>

                            )}

                        </>

                    )}

                </section>

            </div>

        </div>

    );

}


export default StaffChat;