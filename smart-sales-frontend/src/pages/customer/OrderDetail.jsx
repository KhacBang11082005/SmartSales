
import { useEffect, useMemo, useState } from "react";

import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Edit3,
    FileText,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Save,
    ShoppingBag,
    Truck,
    User,
    X,
    XCircle,
    CalendarDays,
    ReceiptText,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getOrderById,
    getOrderDetails,
    updateShippingInformation,
} from "../../services/orderApi";

import "./OrderDetail.css";


function formatPrice(price) {
    return (
        new Intl.NumberFormat("vi-VN").format(Number(price || 0)) +
        " ₫"
    );
}


function formatDate(date) {
    if (!date) return "Chưa cập nhật";

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


function getStatusDescription(status) {
    switch (status) {
        case "PENDING":
            return "Đơn hàng đã được tạo và đang chờ cửa hàng xác nhận.";

        case "CONFIRMED":
            return "Cửa hàng đã xác nhận đơn hàng và đang chuẩn bị sản phẩm.";

        case "PROCESSING":
            return "Đơn hàng đang được xử lý để giao đến bạn.";

        case "COMPLETED":
            return "Đơn hàng đã được giao thành công.";

        case "CANCELLED":
            return "Đơn hàng đã bị hủy và không tiếp tục xử lý.";

        default:
            return "Trạng thái đơn hàng đang được cập nhật.";
    }
}


function getStatusIcon(status, size = 22) {
    switch (status) {
        case "PENDING":
            return <Package size={size} />;

        case "CONFIRMED":
            return <CheckCircle2 size={size} />;

        case "PROCESSING":
            return <Truck size={size} />;

        case "COMPLETED":
            return <CheckCircle2 size={size} />;

        case "CANCELLED":
            return <XCircle size={size} />;

        default:
            return <Package size={size} />;
    }
}


const statusSteps = [
    {
        key: "PENDING",
        label: "Đặt hàng",
        description: "Đã tạo đơn",
        icon: <ShoppingBag size={17} />,
    },

    {
        key: "CONFIRMED",
        label: "Xác nhận",
        description: "Cửa hàng xác nhận",
        icon: <CheckCircle2 size={17} />,
    },

    {
        key: "PROCESSING",
        label: "Đang xử lý",
        description: "Đang chuẩn bị",
        icon: <Package size={17} />,
    },

    {
        key: "COMPLETED",
        label: "Hoàn thành",
        description: "Giao thành công",
        icon: <Truck size={17} />,
    },
];


function getProgressState(status, index) {
    if (status === "CANCELLED") {
        return "cancelled";
    }

    const currentIndex = statusSteps.findIndex(
        (step) => step.key === status
    );

    if (currentIndex === -1) {
        return "";
    }

    if (index < currentIndex) {
        return "completed";
    }

    if (index === currentIndex) {
        return "active";
    }

    return "";
}


function OrderDetail() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    const [orderDetails, setOrderDetails] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [editingShipping, setEditingShipping] = useState(false);

    const [savingShipping, setSavingShipping] = useState(false);

    const [shippingForm, setShippingForm] = useState({
        shippingName: "",
        shippingPhone: "",
        shippingAddress: "",
        shippingNote: "",
    });


    const loadOrder = async () => {
        try {
            setLoading(true);

            setError("");

            const [orderData, detailData] = await Promise.all([
                getOrderById(id),
                getOrderDetails(id),
            ]);

            setOrder(orderData);

            setOrderDetails(
                Array.isArray(detailData)
                    ? detailData
                    : []
            );

            setShippingForm({
                shippingName:
                    orderData?.shippingName || "",

                shippingPhone:
                    orderData?.shippingPhone || "",

                shippingAddress:
                    orderData?.shippingAddress || "",

                shippingNote:
                    orderData?.shippingNote || "",
            });

        } catch (err) {
            console.error(
                "LOAD ORDER DETAIL ERROR:",
                err
            );

            if (err?.response?.status === 401) {
                setError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
            }

            else if (err?.response?.status === 403) {
                setError(
                    "Bạn không có quyền xem đơn hàng này."
                );
            }

            else if (err?.response?.status === 404) {
                setError(
                    "Không tìm thấy đơn hàng."
                );
            }

            else {
                setError(
                    "Không thể tải thông tin đơn hàng."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadOrder();
    }, [id]);


    const handleShippingChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setShippingForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSaveShipping = async () => {
        if (!shippingForm.shippingName.trim()) {
            alert(
                "Vui lòng nhập họ tên người nhận."
            );

            return;
        }

        if (!shippingForm.shippingPhone.trim()) {
            alert(
                "Vui lòng nhập số điện thoại."
            );

            return;
        }

        if (!shippingForm.shippingAddress.trim()) {
            alert(
                "Vui lòng nhập địa chỉ giao hàng."
            );

            return;
        }

        try {
            setSavingShipping(true);

            const updatedOrder =
                await updateShippingInformation(
                    id,
                    shippingForm
                );

            setOrder(updatedOrder);

            setShippingForm({
                shippingName:
                    updatedOrder?.shippingName || "",

                shippingPhone:
                    updatedOrder?.shippingPhone || "",

                shippingAddress:
                    updatedOrder?.shippingAddress || "",

                shippingNote:
                    updatedOrder?.shippingNote || "",
            });

            setEditingShipping(false);

            alert(
                "Cập nhật thông tin giao hàng thành công!"
            );

        } catch (err) {
            console.error(
                "UPDATE SHIPPING ERROR:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Không thể cập nhật thông tin giao hàng.";

            alert(message);

        } finally {
            setSavingShipping(false);
        }
    };


    const handleCancelEditing = () => {
        setEditingShipping(false);

        setShippingForm({
            shippingName:
                order?.shippingName || "",

            shippingPhone:
                order?.shippingPhone || "",

            shippingAddress:
                order?.shippingAddress || "",

            shippingNote:
                order?.shippingNote || "",
        });
    };


    const totalQuantity = useMemo(() => {
        return orderDetails.reduce(
            (total, item) =>
                total +
                Number(item?.quantity || 0),
            0
        );
    }, [orderDetails]);


    const calculatedSubtotal = useMemo(() => {
        return orderDetails.reduce(
            (total, item) => {
                const quantity =
                    Number(
                        item?.quantity || 0
                    );

                const unitPrice =
                    Number(
                        item?.unitPrice ||
                        item?.product?.price ||
                        0
                    );

                const subtotal =
                    item?.subtotal != null
                        ? Number(item.subtotal)
                        : unitPrice * quantity;

                return total + subtotal;
            },
            0
        );
    }, [orderDetails]);


    if (loading) {
        return (
            <div className="order-detail-page">

                <div className="order-detail-state">

                    <div className="state-icon loading-state-icon">
                        <RefreshCw
                            size={30}
                            className="loading-icon"
                        />
                    </div>

                    <h2>
                        Đang tải đơn hàng
                    </h2>

                    <p>
                        Vui lòng chờ trong giây lát...
                    </p>

                </div>

            </div>
        );
    }


    if (error || !order) {
        return (
            <div className="order-detail-page">

                <div className="order-detail-state">

                    <div className="state-icon error-state-icon">
                        <Package size={34} />
                    </div>

                    <h2>
                        Không thể tải đơn hàng
                    </h2>

                    <p>
                        {error ||
                            "Không tìm thấy đơn hàng."}
                    </p>

                    <div className="state-actions">

                        <button
                            type="button"
                            className="primary-state-button"
                            onClick={() =>
                                navigate("/orders")
                            }
                        >
                            <ArrowLeft size={17} />

                            Quay lại đơn hàng
                        </button>

                        <button
                            type="button"
                            className="secondary-state-button"
                            onClick={loadOrder}
                        >
                            <RefreshCw size={17} />

                            Thử lại
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    const statusClass =
        (order.status || "unknown").toLowerCase();


    return (
        <div className="order-detail-page">

            <div className="order-detail-container">

                {/* ================= HEADER ================= */}

                <header className="order-detail-header">

                    <Link
                        to="/orders"
                        className="order-detail-back"
                    >
                        <ArrowLeft size={17} />

                        Đơn hàng của tôi
                    </Link>


                    <div className="order-heading">

                        <div className="order-heading-left">

                            <div className="order-title-row">

                                <h1>
                                    Chi tiết đơn hàng
                                </h1>

                                <span
                                    className={`order-status-badge ${statusClass}`}
                                >
                                    {getStatusIcon(
                                        order.status,
                                        15
                                    )}

                                    {getStatusText(
                                        order.status
                                    )}
                                </span>

                            </div>


                            <div className="order-meta">

                                <span>
                                    <ReceiptText size={14} />

                                    Mã đơn{" "}
                                    <strong>
                                        #{order.id}
                                    </strong>
                                </span>

                                <span>
                                    <CalendarDays size={14} />

                                    {formatDate(
                                        order.orderDate
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                </header>


                {/* ================= CURRENT STATUS ================= */}

                <section
                    className={`current-status-card ${statusClass}`}
                >

                    <div className="current-status-main">

                        <div className="current-status-icon">
                            {getStatusIcon(
                                order.status,
                                25
                            )}
                        </div>


                        <div className="current-status-content">

                            <span className="current-status-label">
                                TRẠNG THÁI HIỆN TẠI
                            </span>

                            <h2>
                                {getStatusText(
                                    order.status
                                )}
                            </h2>

                            <p>
                                {getStatusDescription(
                                    order.status
                                )}
                            </p>

                        </div>

                    </div>


                    <div className="current-status-date">

                        <span>
                            Ngày đặt
                        </span>

                        <strong>
                            {formatDate(
                                order.orderDate
                            )}
                        </strong>

                    </div>

                </section>


                {/* ================= PROGRESS ================= */}

                <section className="order-detail-card progress-card">

                    <div className="compact-section-header">

                        <div className="section-header-icon">
                            <Truck size={18} />
                        </div>

                        <div>

                            <h2>
                                Tiến trình đơn hàng
                            </h2>

                            <p>
                                Theo dõi quá trình xử lý
                            </p>

                        </div>

                    </div>


                    {order.status !== "CANCELLED" ? (

                        <div className="order-timeline">

                            {statusSteps.map(
                                (step, index) => {

                                    const state =
                                        getProgressState(
                                            order.status,
                                            index
                                        );

                                    return (
                                        <div
                                            className="timeline-step-wrapper"
                                            key={step.key}
                                        >

                                            <div
                                                className={`timeline-step ${state}`}
                                            >

                                                <div className="timeline-icon">

                                                    {state ===
                                                    "completed" ? (
                                                        <Check size={16} />
                                                    ) : (
                                                        step.icon
                                                    )}

                                                </div>


                                                <div className="timeline-info">

                                                    <strong>
                                                        {step.label}
                                                    </strong>

                                                    <span>
                                                        {step.description}
                                                    </span>

                                                </div>

                                            </div>


                                            {index <
                                                statusSteps.length -
                                                    1 && (

                                                <div
                                                    className={`timeline-line ${
    state ===
    "completed"
        ? "completed"
        : ""
}`}
                                                />

                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="cancelled-timeline">

                            <div className="cancelled-timeline-icon">
                                <XCircle size={21} />
                            </div>

                            <div>

                                <strong>
                                    Đơn hàng đã bị hủy
                                </strong>

                                <p>
                                    Đơn hàng này không tiếp tục được xử lý.
                                </p>

                            </div>

                        </div>

                    )}

                </section>


                {/* ================= MAIN ================= */}

                <div className="order-content-grid">


                    {/* ================= LEFT ================= */}

                    <div className="order-main-column">


                        {/* PRODUCTS */}

                        <section className="order-detail-card products-card">

                            <div className="compact-section-header">

                                <div className="section-header-icon">
                                    <ShoppingBag size={18} />
                                </div>

                                <div>

                                    <h2>
                                        Sản phẩm đã đặt
                                    </h2>

                                    <p>
                                        {totalQuantity} sản phẩm
                                    </p>

                                </div>

                            </div>


                            <div className="order-products">

                                {orderDetails.length === 0 ? (

                                    <div className="order-products-empty">

                                        <Package size={32} />

                                        <strong>
                                            Không có sản phẩm
                                        </strong>

                                        <p>
                                            Chưa có thông tin sản phẩm.
                                        </p>

                                    </div>

                                ) : (

                                    orderDetails.map(
                                        (detail, index) => {

                                            const product =
                                                detail?.product;

                                            const quantity =
                                                Number(
                                                    detail?.quantity ||
                                                        0
                                                );

                                            const unitPrice =
                                                Number(
                                                    detail?.unitPrice ||
                                                        product?.price ||
                                                        0
                                                );

                                            const subtotal =
                                                detail?.subtotal != null
                                                    ? Number(
                                                        detail.subtotal
                                                    )
                                                    : unitPrice *
                                                      quantity;


                                            return (

                                                <div
                                                    className="order-product-item"
                                                    key={
                                                        detail?.id ||
                                                        index
                                                    }
                                                >

                                                    <div className="order-product-image">

                                                        {product?.imageUrl ? (

                                                            <img
                                                                src={
                                                                    product.imageUrl
                                                                }
                                                                alt={
                                                                    product?.name ||
                                                                    "Sản phẩm"
                                                                }
                                                            />

                                                        ) : (

                                                            <ShoppingBag
                                                                size={25}
                                                            />

                                                        )}

                                                    </div>


                                                    <div className="order-product-info">

                                                        <h3>
                                                            {product?.name ||
                                                                "Sản phẩm"}
                                                        </h3>


                                                        <div className="product-meta-row">

                                                            <span>
                                                                Đơn giá
                                                            </span>

                                                            <strong>
                                                                {formatPrice(
                                                                    unitPrice
                                                                )}
                                                            </strong>

                                                        </div>


                                                        <div className="product-meta-row">

                                                            <span>
                                                                Số lượng
                                                            </span>

                                                            <b className="quantity-badge">
                                                                ×
                                                                {quantity}
                                                            </b>

                                                        </div>

                                                    </div>


                                                    <div className="order-product-subtotal">

                                                        <span>
                                                            Thành tiền
                                                        </span>

                                                        <strong>
                                                            {formatPrice(
                                                                subtotal
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )

                                )}

                            </div>

                        </section>


                        {/* SHIPPING */}

                        <section className="order-detail-card shipping-card">

                            <div className="compact-section-header">

                                <div className="section-header-icon">
                                    <MapPin size={18} />
                                </div>

                                <div>

                                    <h2>
                                        Thông tin giao hàng
                                    </h2>

                                    <p>
                                        Thông tin nhận hàng của đơn
                                    </p>

                                </div>


                                {order.status === "PENDING" &&
                                    !editingShipping && (

                                        <button
                                            type="button"
                                            className="edit-shipping-button"
                                            onClick={() =>
                                                setEditingShipping(
                                                    true
                                                )
                                            }
                                        >

                                            <Edit3 size={14} />

                                            Chỉnh sửa

                                        </button>

                                    )}

                            </div>


                            {!editingShipping ? (

                                <div className="shipping-info-grid">

                                    <div className="shipping-info-item">

                                        <span>
                                            <User size={14} />
                                            Người nhận
                                        </span>

                                        <strong>
                                            {order.shippingName ||
                                                "Chưa có thông tin"}
                                        </strong>

                                    </div>


                                    <div className="shipping-info-item">

                                        <span>
                                            <Phone size={14} />
                                            Số điện thoại
                                        </span>

                                        <strong>
                                            {order.shippingPhone ||
                                                "Chưa có thông tin"}
                                        </strong>

                                    </div>


                                    <div className="shipping-info-item full-width">

                                        <span>
                                            <MapPin size={14} />
                                            Địa chỉ giao hàng
                                        </span>

                                        <strong>
                                            {order.shippingAddress ||
                                                "Chưa có thông tin"}
                                        </strong>

                                    </div>


                                    <div className="shipping-info-item full-width last-item">

                                        <span>
                                            <FileText size={14} />
                                            Ghi chú
                                        </span>

                                        <strong>
                                            {order.shippingNote ||
                                                "Không có ghi chú"}
                                        </strong>

                                    </div>

                                </div>

                            ) : (

                                <div className="shipping-edit-form">

                                    <div className="shipping-form-grid">


                                        <div className="shipping-form-group">

                                            <label>
                                                Họ tên người nhận
                                            </label>

                                            <div className="input-with-icon">

                                                <User size={15} />

                                                <input
                                                    type="text"
                                                    name="shippingName"
                                                    value={
                                                        shippingForm.shippingName
                                                    }
                                                    onChange={
                                                        handleShippingChange
                                                    }
                                                    placeholder="Nhập họ tên"
                                                />

                                            </div>

                                        </div>


                                        <div className="shipping-form-group">

                                            <label>
                                                Số điện thoại
                                            </label>

                                            <div className="input-with-icon">

                                                <Phone size={15} />

                                                <input
                                                    type="text"
                                                    name="shippingPhone"
                                                    value={
                                                        shippingForm.shippingPhone
                                                    }
                                                    onChange={
                                                        handleShippingChange
                                                    }
                                                    placeholder="Nhập số điện thoại"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    <div className="shipping-form-group">

                                        <label>
                                            Địa chỉ giao hàng
                                        </label>

                                        <div className="input-with-icon">

                                            <MapPin size={15} />

                                            <input
                                                type="text"
                                                name="shippingAddress"
                                                value={
                                                    shippingForm.shippingAddress
                                                }
                                                onChange={
                                                    handleShippingChange
                                                }
                                                placeholder="Nhập địa chỉ giao hàng"
                                            />

                                        </div>

                                    </div>


                                    <div className="shipping-form-group">

                                        <label>
                                            Ghi chú
                                        </label>

                                        <div className="input-with-icon textarea-icon">

                                            <FileText size={15} />

                                            <textarea
                                                name="shippingNote"
                                                value={
                                                    shippingForm.shippingNote
                                                }
                                                onChange={
                                                    handleShippingChange
                                                }
                                                placeholder="Ví dụ: Giao giờ hành chính..."
                                                rows="3"
                                            />

                                        </div>

                                    </div>


                                    <div className="shipping-form-actions">

                                        <button
                                            type="button"
                                            className="cancel-shipping-button"
                                            onClick={
                                                handleCancelEditing
                                            }
                                            disabled={
                                                savingShipping
                                            }
                                        >

                                            <X size={15} />

                                            Hủy

                                        </button>


                                        <button
                                            type="button"
                                            className="save-shipping-button"
                                            onClick={
                                                handleSaveShipping
                                            }
                                            disabled={
                                                savingShipping
                                            }
                                        >

                                            {savingShipping ? (

                                                <RefreshCw
                                                    size={15}
                                                    className="button-spin"
                                                />

                                            ) : (

                                                <Save size={15} />

                                            )}

                                            {savingShipping
                                                ? "Đang lưu..."
                                                : "Lưu thay đổi"}

                                        </button>

                                    </div>

                                </div>

                            )}

                        </section>

                    </div>


                    {/* ================= RIGHT ================= */}

                    <aside className="order-side-column">


                        {/* PAYMENT */}

                        <section className="order-detail-card order-payment-card">

                            <div className="compact-section-header">

                                <div className="section-header-icon">
                                    <ReceiptText size={18} />
                                </div>

                                <div>

                                    <h2>
                                        Tổng thanh toán
                                    </h2>

                                    <p>
                                        Chi tiết chi phí đơn hàng
                                    </p>

                                </div>

                            </div>


                            <div className="summary-content">

                                <div className="summary-row">

                                    <span>
                                        Số lượng sản phẩm
                                    </span>

                                    <strong>
                                        {totalQuantity}
                                    </strong>

                                </div>

                                {/* =================================================
                                       TẠM TÍNH
                                    ================================================= */}

                                <div className="summary-row">

                                    <span>
                                        Tạm tính
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            calculatedSubtotal
                                        )}
                                    </strong>

                                </div>


                                {/* =================================================
                                       KHUYẾN MẠI
                                       Chỉ hiển thị khi đơn hàng có giảm giá
                                    ================================================= */}

                                {Number(order.discountAmount || 0) > 0 && (

                                    <div className="summary-row promotion-discount-row">

                                        <span>
                                            Giảm khuyến mại
                                        </span>

                                        <strong>
                                            - {formatPrice(
                                            order.discountAmount
                                        )}
                                        </strong>

                                    </div>

                                )}


                                {/* =================================================
                                       MÃ KHUYẾN MẠI
                                    ================================================= */}

                                {order.promotionCode && (

                                    <div className="summary-row promotion-code-row">

                                        <span>
                                            Mã khuyến mại
                                        </span>

                                        <strong>
                                            {order.promotionCode}
                                        </strong>

                                    </div>

                                )}


                                {/* =================================================
                                       PHÍ GIAO HÀNG
                                    ================================================= */}

                                <div className="summary-row">

                                    <span>
                                        Phí giao hàng
                                    </span>

                                    <strong className="free-shipping">
                                        Miễn phí
                                    </strong>

                                </div>


                                <div className="summary-divider" />


                                {/* =================================================
                                       TỔNG THANH TOÁN
                                    ================================================= */}

                                <div className="summary-total">

                                    <div>

                                        <span>
                                            Tổng thanh toán
                                        </span>

                                        <small>
                                            Đã áp dụng khuyến mại nếu có
                                        </small>

                                    </div>


                                    <strong>
                                        {formatPrice(
                                            order.totalAmount
                                        )}
                                    </strong>

                                </div>


                            </div>

                        </section>

                    </aside>

                </div>




            </div>

        </div>
    );
}


export default OrderDetail;

