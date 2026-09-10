
import { useEffect, useMemo, useState } from "react";

import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Edit3,
    FileText,
    Mail,
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
} from "lucide-react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getOrderById,
    getOrderDetails,
    updateShippingInformation,
} from "../../services/orderApi";

import "./OrderDetail.css";


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


// ======================================================
// STATUS DESCRIPTION
// ======================================================

function getStatusDescription(status) {
    switch (status) {
        case "PENDING":
            return "Đơn hàng của bạn đang chờ cửa hàng xác nhận.";

        case "CONFIRMED":
            return "Cửa hàng đã xác nhận đơn hàng và sẽ chuẩn bị sản phẩm.";

        case "PROCESSING":
            return "Đơn hàng đang được xử lý và chuẩn bị giao đến bạn.";

        case "COMPLETED":
            return "Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm!";

        case "CANCELLED":
            return "Đơn hàng này đã được hủy và không tiếp tục xử lý.";

        default:
            return "Trạng thái đơn hàng đang được cập nhật.";
    }
}


// ======================================================
// STATUS ICON
// ======================================================

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


// ======================================================
// STATUS STEPS
// ======================================================

const statusSteps = [
    {
        key: "PENDING",
        label: "Đặt hàng",
        description: "Đơn hàng đã được tạo",
        icon: <ShoppingBag size={17} />,
    },
    {
        key: "CONFIRMED",
        label: "Xác nhận",
        description: "Cửa hàng đã xác nhận",
        icon: <CheckCircle2 size={17} />,
    },
    {
        key: "PROCESSING",
        label: "Đang xử lý",
        description: "Đang chuẩn bị đơn hàng",
        icon: <Package size={17} />,
    },
    {
        key: "COMPLETED",
        label: "Hoàn thành",
        description: "Đã giao thành công",
        icon: <Truck size={17} />,
    },
];


// ======================================================
// GET PROGRESS STATE
// ======================================================

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


// ======================================================
// ORDER DETAIL
// ======================================================

function OrderDetail() {
    const { id } = useParams();

    const navigate = useNavigate();

    // ==================================================
    // STATE
    // ==================================================

    const [order, setOrder] = useState(null);

    const [orderDetails, setOrderDetails] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [editingShipping, setEditingShipping] =
        useState(false);

    const [savingShipping, setSavingShipping] =
        useState(false);

    const [shippingForm, setShippingForm] =
        useState({
            shippingName: "",
            shippingPhone: "",
            shippingAddress: "",
            shippingNote: "",
        });


    // ==================================================
    // LOAD ORDER
    // ==================================================

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError("");

            /*
             * Gọi song song 2 API:
             * - Thông tin đơn hàng
             * - Danh sách sản phẩm
             */
            const [
                orderData,
                detailData,
            ] = await Promise.all([
                getOrderById(id),
                getOrderDetails(id),
            ]);

            console.log(
                "📦 ORDER:",
                orderData
            );

            console.log(
                "📦 ORDER DETAILS:",
                detailData
            );

            setOrder(orderData);

            setOrderDetails(
                Array.isArray(detailData)
                    ? detailData
                    : []
            );

            setShippingForm({
                shippingName:
                    orderData?.shippingName ||
                    "",

                shippingPhone:
                    orderData?.shippingPhone ||
                    "",

                shippingAddress:
                    orderData?.shippingAddress ||
                    "",

                shippingNote:
                    orderData?.shippingNote ||
                    "",
            });
        } catch (err) {
            console.error(
                "❌ LOAD ORDER DETAIL ERROR:",
                err
            );

            if (err?.response?.status === 401) {
                setError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
            } else if (
                err?.response?.status === 403
            ) {
                setError(
                    "Bạn không có quyền xem đơn hàng này."
                );
            } else if (
                err?.response?.status === 404
            ) {
                setError(
                    "Không tìm thấy đơn hàng."
                );
            } else {
                setError(
                    "Không thể tải thông tin đơn hàng. Vui lòng thử lại."
                );
            }
        } finally {
            setLoading(false);
        }
    };


    // ==================================================
    // USE EFFECT
    // ==================================================

    useEffect(() => {
        loadOrder();
    }, [id]);


    // ==================================================
    // SHIPPING CHANGE
    // ==================================================

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


    // ==================================================
    // SAVE SHIPPING
    // ==================================================

    const handleSaveShipping = async () => {
        if (
            !shippingForm.shippingName.trim()
        ) {
            alert(
                "Vui lòng nhập họ tên người nhận."
            );
            return;
        }

        if (
            !shippingForm.shippingPhone.trim()
        ) {
            alert(
                "Vui lòng nhập số điện thoại."
            );
            return;
        }

        if (
            !shippingForm.shippingAddress.trim()
        ) {
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
                    updatedOrder?.shippingName ||
                    "",

                shippingPhone:
                    updatedOrder?.shippingPhone ||
                    "",

                shippingAddress:
                    updatedOrder?.shippingAddress ||
                    "",

                shippingNote:
                    updatedOrder?.shippingNote ||
                    "",
            });

            setEditingShipping(false);

            alert(
                "Cập nhật thông tin giao hàng thành công!"
            );
        } catch (err) {
            console.error(
                "❌ UPDATE SHIPPING ERROR:",
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


    // ==================================================
    // CANCEL EDIT
    // ==================================================

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


    // ==================================================
    // CALCULATE PRODUCT COUNT
    // ==================================================

    const totalQuantity = useMemo(() => {
        return orderDetails.reduce(
            (total, item) =>
                total +
                Number(item?.quantity || 0),
            0
        );
    }, [orderDetails]);


    // ==================================================
    // CALCULATE SUBTOTAL
    // ==================================================

    const calculatedSubtotal = useMemo(() => {
        return orderDetails.reduce(
            (total, item) =>
                total +
                Number(
                    item?.subtotal ||
                    (
                        Number(
                            item?.unitPrice || 0
                        ) *
                        Number(
                            item?.quantity || 0
                        )
                    )
                ),
            0
        );
    }, [orderDetails]);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-state">
                    <div className="state-icon loading-state-icon">
                        <RefreshCw
                            size={31}
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


    // ==================================================
    // ERROR
    // ==================================================

    if (error || !order) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-state">
                    <div className="state-icon error-state-icon">
                        <Package size={38} />
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
                                navigate(
                                    "/orders"
                                )
                            }
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Quay lại đơn hàng
                        </button>

                        <button
                            type="button"
                            className="secondary-state-button"
                            onClick={
                                loadOrder
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


    const statusClass = (
        order.status || "unknown"
    ).toLowerCase();


    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="order-detail-page">

            <div className="order-detail-container">

                {/* ======================================
                    BREADCRUMB / BACK
                ====================================== */}

                <div className="order-detail-header">

                    <Link
                        to="/orders"
                        className="order-detail-back"
                    >
                        <ArrowLeft size={18} />

                        <span>
                            Đơn hàng của tôi
                        </span>
                    </Link>

                    <div className="order-heading">
                        <div>


                            <h1>
                                Chi tiết đơn hàng
                            </h1>

                            <p>
                                Theo dõi trạng thái và
                                thông tin đơn hàng của bạn.
                            </p>
                        </div>

                        <div className="order-id-badge">
                            <span>
                                Mã đơn hàng
                            </span>

                            <strong>
                                #{order.id}
                            </strong>
                        </div>
                    </div>
                </div>


                {/* ======================================
                    CURRENT STATUS
                ====================================== */}

                <section
                    className={`current-status-card ${statusClass}`}
                >

                    <div className="current-status-main">

                        <div className="current-status-icon">
                            {getStatusIcon(
                                order.status,
                                27
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
                            Ngày đặt hàng
                        </span>

                        <strong>
                            {formatDate(
                                order.orderDate
                            )}
                        </strong>
                    </div>

                </section>





                {/* ======================================
                    ORDER TIMELINE
                ====================================== */}

                <section className="order-detail-card">

                    <div className="section-header">

                        <div className="section-header-icon">
                            <Truck size={19} />
                        </div>

                        <div>
                            <h2>
                                Theo dõi đơn hàng
                            </h2>

                            <p>
                                Tiến trình xử lý đơn hàng
                            </p>
                        </div>

                    </div>

                    {order.status !==
                    "CANCELLED" ? (
                        <div className="order-timeline">

                            {statusSteps.map(
                                (
                                    step,
                                    index
                                ) => {
                                    const state =
                                        getProgressState(
                                            order.status,
                                            index
                                        );

                                    return (
                                        <div
                                            className="timeline-step-wrapper"
                                            key={
                                                step.key
                                            }
                                        >

                                            <div
                                                className={`timeline-step ${state}`}
                                            >
                                                <div className="timeline-icon">
                                                    {state ===
                                                    "completed" ? (
                                                        <Check
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    ) : (
                                                        step.icon
                                                    )}
                                                </div>

                                                <div className="timeline-info">
                                                    <strong>
                                                        {
                                                            step.label
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            step.description
                                                        }
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
                                <XCircle
                                    size={23}
                                />
                            </div>

                            <div>
                                <strong>
                                    Đơn hàng đã dừng xử lý
                                </strong>

                                <p>
                                    Vui lòng quay lại cửa
                                    hàng nếu bạn muốn đặt
                                    một đơn hàng mới.
                                </p>
                            </div>

                        </div>
                    )}

                </section>


                {/* ======================================
                    TWO COLUMN AREA
                ====================================== */}

                <div className="order-main-grid">

                    {/* ==================================
                        PRODUCTS
                    ================================== */}

                    <section className="order-detail-card products-card">

                        <div className="section-header">

                            <div className="section-header-icon">
                                <ShoppingBag
                                    size={19}
                                />
                            </div>

                            <div>
                                <h2>
                                    Sản phẩm đã đặt
                                </h2>

                                <p>
                                    {totalQuantity} sản phẩm
                                    trong đơn hàng
                                </p>
                            </div>

                        </div>

                        <div className="order-products">

                            {orderDetails.length ===
                            0 ? (
                                <div className="order-products-empty">
                                    <Package
                                        size={34}
                                    />

                                    <strong>
                                        Không có sản phẩm
                                    </strong>

                                    <p>
                                        Chưa có thông tin sản
                                        phẩm trong đơn hàng.
                                    </p>
                                </div>
                            ) : (
                                orderDetails.map(
                                    (
                                        detail,
                                        index
                                    ) => {
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
                                            Number(
                                                detail?.subtotal ||
                                                    unitPrice *
                                                        quantity
                                            );

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
                                                            size={
                                                                27
                                                            }
                                                        />
                                                    )}

                                                </div>


                                                <div className="order-product-info">

                                                    <h3>
                                                        {
                                                            product?.name ||
                                                            "Sản phẩm"
                                                        }
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
                                                            {
                                                                quantity
                                                            }
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


                    {/* ==================================
                        ORDER SUMMARY
                    ================================== */}

                    <aside className="order-summary-card">

                        <div className="summary-header">

                            <div className="summary-header-icon">
                                <FileText
                                    size={19}
                                />
                            </div>

                            <div>
                                <h2>
                                    Tóm tắt đơn hàng
                                </h2>

                                <p>
                                    Chi phí của đơn hàng
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

                            <div className="summary-row">
                                <span>
                                    Phí giao hàng
                                </span>

                                <strong className="free-shipping">
                                    Miễn phí
                                </strong>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-total">
                                <div>
                                    <span>
                                        Tổng thanh toán
                                    </span>

                                    <small>
                                        Đã bao gồm giá sản phẩm
                                    </small>
                                </div>

                                <strong>
                                    {formatPrice(
                                        order.totalAmount
                                    )}
                                </strong>
                            </div>

                        </div>

                    </aside>

                </div>


                {/* ======================================
                    SHIPPING INFORMATION
                ====================================== */}

                <section className="order-detail-card shipping-card">

                    <div className="section-header">

                        <div className="section-header-icon">
                            <MapPin size={19} />
                        </div>

                        <div>
                            <h2>
                                Thông tin giao hàng
                            </h2>

                            <p>
                                Thông tin nhận hàng của đơn này
                            </p>
                        </div>

                        {order.status ===
                            "PENDING" &&
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
                                    <Edit3
                                        size={15}
                                    />

                                    Chỉnh sửa
                                </button>
                            )}

                    </div>


                    {!editingShipping ? (
                        <div className="shipping-info-grid">

                            <div className="shipping-info-item">

                                <span>
                                    <User size={15} />

                                    Người nhận
                                </span>

                                <strong>
                                    {order.shippingName ||
                                        "Chưa có thông tin"}
                                </strong>

                            </div>


                            <div className="shipping-info-item">

                                <span>
                                    <Phone size={15} />

                                    Số điện thoại
                                </span>

                                <strong>
                                    {order.shippingPhone ||
                                        "Chưa có thông tin"}
                                </strong>

                            </div>


                            <div className="shipping-info-item shipping-address-item">

                                <span>
                                    <MapPin size={15} />

                                    Địa chỉ giao hàng
                                </span>

                                <strong>
                                    {order.shippingAddress ||
                                        "Chưa có thông tin"}
                                </strong>

                            </div>


                            <div className="shipping-info-item shipping-note-item">

                                <span>
                                    <FileText size={15} />

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

                                        <User size={16} />

                                        <input
                                            type="text"
                                            name="shippingName"
                                            value={
                                                shippingForm.shippingName
                                            }
                                            onChange={
                                                handleShippingChange
                                            }
                                            placeholder="Nhập họ tên người nhận"
                                        />

                                    </div>

                                </div>


                                <div className="shipping-form-group">

                                    <label>
                                        Số điện thoại
                                    </label>

                                    <div className="input-with-icon">

                                        <Phone size={16} />

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

                                    <MapPin size={16} />

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

                                    <FileText
                                        size={16}
                                    />

                                    <textarea
                                        name="shippingNote"
                                        value={
                                            shippingForm.shippingNote
                                        }
                                        onChange={
                                            handleShippingChange
                                        }
                                        placeholder="Ví dụ: Giao giờ hành chính..."
                                        rows="4"
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
                                    <X size={16} />

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
                                            size={16}
                                            className="button-spin"
                                        />
                                    ) : (
                                        <Save
                                            size={16}
                                        />
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
        </div>
    );
}


export default OrderDetail;

