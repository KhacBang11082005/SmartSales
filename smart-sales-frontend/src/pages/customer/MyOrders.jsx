
import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    Eye,
    Package,
    RefreshCw,
    ShoppingBag,
    Truck,
    XCircle,
    ChevronRight, ArrowLeft,
} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

import {
    getMyOrders,
    cancelOrder,
} from "../../services/orderApi";

import "./MyOrders.css";


// ======================================================
// XỬ LÝ URL ẢNH SẢN PHẨM
// ======================================================
// Backend trả về:
// /uploads/abc.jpg
//
// Frontend cần:
// http://localhost:8080/uploads/abc.jpg
//
// Nếu backend đã trả về URL đầy đủ:
// https://...
// thì giữ nguyên.
// ======================================================

function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }

    // Nếu đã là URL đầy đủ
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Nếu backend trả về /uploads/...
    return `http://localhost:8080${imageUrl}`;
    }



// ======================================================
// FORMAT PRICE
// ======================================================

function formatPrice(price) {
    return (
        new Intl.NumberFormat("vi-VN").format(
            Number(price || 0)
        ) + " ₫"
    );
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {
    if (!date) {
        return "Chưa cập nhật";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "Chưa cập nhật";
    }

    return value.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ======================================================
// STATUS
// ======================================================

function getStatusText(status) {
    switch (status) {
        case "PENDING":
            return "Chờ xác nhận";

        case "CONFIRMED":
            return "Đã xác nhận";

        case "PROCESSING":
            return "Đang xử lý";

        case "COMPLETED":
            return "Hoàn thành";

        case "CANCELLED":
            return "Đã hủy";

        default:
            return "Không xác định";
    }
}

function getStatusIcon(status) {
    switch (status) {
        case "PENDING":
            return <Clock3 size={16} />;

        case "CONFIRMED":
            return <CheckCircle2 size={16} />;

        case "PROCESSING":
            return <Truck size={16} />;

        case "COMPLETED":
            return <CheckCircle2 size={16} />;

        case "CANCELLED":
            return <XCircle size={16} />;

        default:
            return <Package size={16} />;
    }
}

// ======================================================
// STATUS DESCRIPTION
// ======================================================

function getStatusDescription(status) {
    switch (status) {
        case "PENDING":
            return "Đơn hàng đang chờ cửa hàng xác nhận.";

        case "CONFIRMED":
            return "Cửa hàng đã xác nhận đơn hàng của bạn.";

        case "PROCESSING":
            return "Đơn hàng đang được chuẩn bị để giao.";

        case "COMPLETED":
            return "Đơn hàng đã được giao thành công.";

        case "CANCELLED":
            return "Đơn hàng này đã được hủy.";

        default:
            return "Đang cập nhật trạng thái đơn hàng.";
    }
}

// ======================================================
// GET PRODUCTS
// ======================================================

function getOrderProducts(order) {
    if (!Array.isArray(order?.orderDetails)) {
        return [];
    }

    return order.orderDetails
        .map((item) => ({
            id: item?.id,
            name:
                item?.product?.name ||
                item?.productName ||
                "Sản phẩm",
            image:
                item?.product?.imageUrl ||
                item?.imageUrl ||
                "",
            quantity: Number(item?.quantity || 0),
            price: Number(
                item?.price ??
                item?.unitPrice ??
                item?.product?.price ??
                0
            ),
        }))
        .filter((item) => item.quantity > 0);
}

// ======================================================
// ITEM COUNT
// ======================================================

function getItemCount(order) {
    const products = getOrderProducts(order);

    return products.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

// ======================================================
// STATUS PROGRESS
// ======================================================

const statusSteps = [
    {
        key: "PENDING",
        label: "Đặt hàng",
        icon: <ShoppingBag size={15} />,
    },
    {
        key: "CONFIRMED",
        label: "Xác nhận",
        icon: <CheckCircle2 size={15} />,
    },
    {
        key: "PROCESSING",
        label: "Đang xử lý",
        icon: <Package size={15} />,
    },
    {
        key: "COMPLETED",
        label: "Hoàn thành",
        icon: <Truck size={15} />,
    },
];

function getStepState(status, stepIndex) {
    if (status === "CANCELLED") {
        return "cancelled";
    }

    const currentIndex = statusSteps.findIndex(
        (step) => step.key === status
    );

    if (currentIndex === -1) {
        return "";
    }

    if (stepIndex < currentIndex) {
        return "done";
    }

    if (stepIndex === currentIndex) {
        return "active";
    }

    return "";
}

// ======================================================
// FILTERS
// ======================================================

const filters = [
    {
        key: "ALL",
        label: "Tất cả",
    },
    {
        key: "PENDING",
        label: "Chờ xác nhận",
    },
    {
        key: "PROCESSING",
        label: "Đang xử lý",
    },
    {
        key: "COMPLETED",
        label: "Hoàn thành",
    },
    {
        key: "CANCELLED",
        label: "Đã hủy",
    },
];

// ======================================================
// ORDER CARD
// ======================================================

function OrderCard({
    order,
    onViewDetail,
    onCancel,
}) {
    const products = getOrderProducts(order);

    const itemCount = getItemCount(order);

    const isCancelled =
        order.status === "CANCELLED";

    const canCancel =
        order.status === "PENDING";

    return (
        <article className="order-card">
            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="order-card-header">
                <div className="order-number">
                    <div className="order-icon">
                        <Package size={19} />
                    </div>

                    <div>
                        <span>Đơn hàng</span>

                        <strong>
                            #{order.id}
                        </strong>
                    </div>
                </div>

                <div
                    className={`order-status status-${(
    order.status || ""
).toLowerCase()}`}
                >
                    {getStatusIcon(order.status)}

                    <span>
                        {getStatusText(
                            order.status
                        )}
                    </span>
                </div>
            </div>

            {/* ==========================================
                META
            ========================================== */}

            <div className="order-meta">
                <div>
                    <span>Ngày đặt</span>

                    <strong>
                        {formatDate(
                            order.createdAt ||
                            order.orderDate ||
                            order.createdDate
                        )}
                    </strong>
                </div>

                <div>
                    <span>Số lượng</span>

                    <strong>
                        {itemCount} sản phẩm
                    </strong>
                </div>
            </div>

            {/* ==========================================
                STATUS MESSAGE
            ========================================== */}

            <div
                className={`order-status-message status-message-${(
    order.status || ""
).toLowerCase()}`}
            >
                <div className="status-message-icon">
                    {getStatusIcon(
                        order.status
                    )}
                </div>

                <div>
                    <strong>
                        {getStatusText(
                            order.status
                        )}
                    </strong>

                    <p>
                        {getStatusDescription(
                            order.status
                        )}
                    </p>
                </div>
            </div>

            {/* ==========================================
                PROGRESS
            ========================================== */}

            {!isCancelled && (
                <div className="order-progress">
                    {statusSteps.map(
                        (step, index) => {
                            const state =
                                getStepState(
                                    order.status,
                                    index
                                );

                            return (
                                <div
                                    className="progress-step-wrapper"
                                    key={step.key}
                                >
                                    <div
                                        className={`progress-step ${state}`}
                                    >
                                        <div className="progress-circle">
                                            {step.icon}
                                        </div>

                                        <span>
                                            {step.label}
                                        </span>
                                    </div>

                                    {index <
                                        statusSteps.length -
                                            1 && (
                                        <div
                                            className={`progress-line ${
    state ===
    "done"
        ? "done"
        : ""
}`}
                                        />
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            )}



            {/* ==========================================
                PRODUCTS
            ========================================== */}

            <div className="order-products">
                <div className="order-products-title">
                    <span>
                        Sản phẩm trong đơn
                    </span>

                    <span>
                        {products.length} mặt hàng
                    </span>
                </div>

                <div className="order-product-list">
                    {products.length > 0 ? (
                        products
                            .slice(0, 3)
                            .map((product, index) => (
                                <div
                                    className="order-product"
                                    key={
                                        product.id ||
                                        index
                                    }
                                >
                                    <div className="order-product-image">
                                        {product.image ? (

                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                            />


                                        ) : (
                                            <Package
                                                size={25}
                                            />
                                        )}
                                    </div>

                                    <div className="order-product-info">
                                        <strong>
                                            {
                                                product.name
                                            }
                                        </strong>

                                        <span>
                                            Số lượng:{" "}
                                            {
                                                product.quantity
                                            }
                                        </span>
                                    </div>

                                    <strong className="order-product-price">
                                        {formatPrice(
                                            product.price *
                                                product.quantity
                                        )}
                                    </strong>
                                </div>
                            ))
                    ) : (
                        <div className="order-product-empty">
                            <Package size={20} />
                            <span>
                                Không có thông tin
                                sản phẩm.
                            </span>
                        </div>
                    )}
                </div>

                {products.length > 3 && (
                    <button
                        type="button"
                        className="more-products-button"
                        onClick={() =>
                            onViewDetail(order.id)
                        }
                    >
                        Xem thêm{" "}
                        {products.length - 3} sản phẩm
                    </button>
                )}
            </div>

            {/* ==========================================
                FOOTER
            ========================================== */}

            <div className="order-card-footer">
                <div className="order-total">
                    <span>
                        Tổng thanh toán
                    </span>

                    <strong>
                        {formatPrice(
                            order.totalAmount ??
                            order.totalPrice ??
                            order.total
                        )}
                    </strong>
                </div>

                <div className="order-actions">
                    {canCancel && (
                        <button
                            type="button"
                            className="cancel-order-button"
                            onClick={() =>
                                onCancel(order.id)
                            }
                        >
                            <XCircle size={16} />

                            Hủy đơn
                        </button>
                    )}

                    <button
                        type="button"
                        className="view-order-button"
                        onClick={() =>
                            onViewDetail(order.id)
                        }
                    >
                        <Eye size={17} />

                        Xem chi tiết

                        <ChevronRight
                            size={16}
                        />
                    </button>
                </div>
            </div>
        </article>
    );
}

// ======================================================
// MAIN
// ======================================================

function MyOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    const [filter, setFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);

    // ==================================================
    // LOAD ORDERS
    // ==================================================

    const loadOrders = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data =
                await getMyOrders();

            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "LOAD ORDERS ERROR:",
                err
            );

            if (
                err?.response?.status === 401
            ) {
                setError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
            } else if (
                err?.response?.status === 403
            ) {
                setError(
                    "Bạn không có quyền xem đơn hàng."
                );
            } else {
                setError(
                    "Không thể tải danh sách đơn hàng. Vui lòng thử lại."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ==================================================
    // INITIAL
    // ==================================================

    useEffect(() => {
        loadOrders();
    }, []);

    // ==================================================
    // CANCEL ORDER
    // ==================================================

    const handleCancelOrder = async (
        orderId
    ) => {
        const confirmed =
            window.confirm(
                "Bạn có chắc chắn muốn hủy đơn hàng này không?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await cancelOrder(orderId);

            window.alert(
                "Hủy đơn hàng thành công!"
            );

            await loadOrders(true);
        } catch (err) {
            console.error(
                "CANCEL ORDER ERROR:",
                err
            );

            const message =
                err?.response?.data
                    ?.message ||
                err?.response?.data ||
                err?.message ||
                "Không thể hủy đơn hàng.";

            window.alert(message);
        }
    };

    // ==================================================
    // COUNTS
    // ==================================================

    const counts = useMemo(() => {
        return {
            all: orders.length,

            pending: orders.filter(
                (order) =>
                    order.status ===
                    "PENDING"
            ).length,

            processing: orders.filter(
                (order) =>
                    order.status ===
                        "CONFIRMED" ||
                    order.status ===
                        "PROCESSING"
            ).length,

            completed: orders.filter(
                (order) =>
                    order.status ===
                    "COMPLETED"
            ).length,

            cancelled: orders.filter(
                (order) =>
                    order.status ===
                    "CANCELLED"
            ).length,
        };
    }, [orders]);

    // ==================================================
    // FILTER
    // ==================================================

    const filteredOrders = useMemo(() => {
        if (filter === "ALL") {
            return orders;
        }

        if (filter === "PROCESSING") {
            return orders.filter(
                (order) =>
                    order.status ===
                        "CONFIRMED" ||
                    order.status ===
                        "PROCESSING"
            );
        }

        return orders.filter(
            (order) =>
                order.status === filter
        );
    }, [orders, filter]);

    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="orders-loading">
                    <div className="loading-spinner">
                        <RefreshCw size={27} />
                    </div>

                    <h3>
                        Đang tải đơn hàng
                    </h3>

                    <p>
                        Vui lòng chờ trong giây lát...
                    </p>
                </div>
            </div>
        );
    }

    // ==================================================
    // ERROR
    // ==================================================

    if (error) {
        return (
            <div className="my-orders-page">
                <div className="orders-container">
                    <div className="orders-error">
                        <div className="orders-state-icon">
                            <Package size={38} />
                        </div>

                        <h2>
                            Không thể tải đơn hàng
                        </h2>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() =>
                                loadOrders()
                            }
                        >
                            <RefreshCw
                                size={17}
                            />

                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================================================
    // EMPTY
    // ==================================================

    if (orders.length === 0) {
        return (
            <div className="my-orders-page">
                <div className="orders-container">
                    <div className="orders-header">
                        <div>
                            <span className="orders-brand">
                                SMART SALES
                            </span>

                            <h1>
                                Đơn hàng của tôi
                            </h1>

                            <p>
                                Theo dõi và quản lý
                                các đơn hàng của bạn.
                            </p>
                        </div>
                    </div>

                    <div className="orders-empty">
                        <div className="empty-icon">
                            <ShoppingBag
                                size={42}
                            />
                        </div>

                        <h2>
                            Bạn chưa có đơn hàng
                        </h2>

                        <p>
                            Hãy khám phá các sản
                            phẩm điện tử và bắt đầu
                            mua sắm tại SmartSales.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >
                            <ShoppingBag
                                size={18}
                            />

                            Mua sắm ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="my-orders-page">
            <div className="orders-container">

                {/* ======================================
                    HEADER
                ====================================== */}

                <header className="orders-header">
                    <div>
                        <Link
                            to="/"
                            className="order-detail-back"
                        >
                            <ArrowLeft size={18} />

                            <span>
                            Đơn hàng của tôi
                        </span>
                        </Link>

                        <h1>
                            Đơn hàng của tôi
                        </h1>

                        <p>
                            Theo dõi trạng thái và
                            thông tin các đơn hàng của
                            bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-button"
                        onClick={() =>
                            loadOrders(true)
                        }
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Đang cập nhật"
                            : "Làm mới"}
                    </button>
                </header>

                {/* ======================================
                    STATISTICS
                ====================================== */}

                <section className="orders-overview">

                    <div className="overview-card overview-main">
                        <div className="overview-icon">
                            <ShoppingBag
                                size={21}
                            />
                        </div>

                        <div>
                            <span>
                                Tổng đơn hàng
                            </span>

                            <strong>
                                {counts.all}
                            </strong>
                        </div>
                    </div>

                    <div className="overview-card">
                        <div className="overview-icon pending-icon">
                            <Clock3
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Chờ xác nhận
                            </span>

                            <strong>
                                {counts.pending}
                            </strong>
                        </div>
                    </div>

                    <div className="overview-card">
                        <div className="overview-icon processing-icon">
                            <Truck
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Đang xử lý
                            </span>

                            <strong>
                                {counts.processing}
                            </strong>
                        </div>
                    </div>

                    <div className="overview-card">
                        <div className="overview-icon completed-icon">
                            <CheckCircle2
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Hoàn thành
                            </span>

                            <strong>
                                {counts.completed}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* ======================================
                    TOOLBAR
                ====================================== */}

                <section className="orders-toolbar">

                    <div className="orders-toolbar-title">
                        <h2>
                            Lịch sử mua hàng
                        </h2>

                        <p>
                            {filteredOrders.length}{" "}
                            đơn hàng được hiển thị
                        </p>
                    </div>

                    <div className="order-filters">
                        {filters.map(
                            (item) => {
                                const count =
                                    item.key ===
                                    "ALL"
                                        ? counts.all
                                        : item.key ===
                                          "PENDING"
                                        ? counts.pending
                                        : item.key ===
                                          "PROCESSING"
                                        ? counts.processing
                                        : item.key ===
                                          "COMPLETED"
                                        ? counts.completed
                                        : counts.cancelled;

                                return (
                                    <button
                                        type="button"
                                        key={
                                            item.key
                                        }
                                        className={
                                            filter ===
                                            item.key
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setFilter(
                                                item.key
                                            )
                                        }
                                    >
                                        {item.label}

                                        <b>
                                            {count}
                                        </b>
                                    </button>
                                );
                            }
                        )}
                    </div>

                </section>

                {/* ======================================
                    ORDER LIST
                ====================================== */}

                <section className="orders-list">

                    {filteredOrders.length ===
                    0 ? (
                        <div className="filter-empty">
                            <div>
                                <Package
                                    size={34}
                                />
                            </div>

                            <h3>
                                Không có đơn hàng
                            </h3>

                            <p>
                                Chưa có đơn hàng nào
                                thuộc trạng thái này.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setFilter(
                                        "ALL"
                                    )
                                }
                            >
                                Xem tất cả đơn hàng
                            </button>
                        </div>
                    ) : (
                        filteredOrders.map(
                            (order) => (
                                <OrderCard
                                    key={
                                        order.id
                                    }
                                    order={
                                        order
                                    }
                                    onViewDetail={(
                                        orderId
                                    ) =>
                                        navigate(
                                            `/orders/${orderId}`
                                        )
                                    }
                                    onCancel={
                                        handleCancelOrder
                                    }
                                />
                            )
                        )
                    )}

                </section>

            </div>
        </div>
    );
}

export default MyOrders;

