import {
    Check,
    ChevronDown,
    Clock3,
    Eye,
    Package,
    Search,
    Truck,
    X,
    XCircle
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getMyOrders,
    updateOrderStatus
} from "../../services/orderApi";

import "./AdminOrders.css";


/*
=========================================================
FORMAT TIỀN
=========================================================
Chuyển số tiền thành định dạng tiền Việt Nam.

Ví dụ:
1500000 → 1.500.000 ₫
*/
const formatPrice = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0 ₫";
    }

    return (
        new Intl.NumberFormat("vi-VN").format(
            Number(value)
        ) + " ₫"
    );
};


/*
=========================================================
FORMAT NGÀY GIỜ
=========================================================
Chuyển LocalDateTime từ backend thành dạng dễ đọc.

Ví dụ:
2026-09-10T14:30:00
→ 10/09/2026 14:30
*/
const formatDateTime = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};


/*
=========================================================
TÊN TRẠNG THÁI
=========================================================
Backend sử dụng Enum:

PENDING
CONFIRMED
PROCESSING
COMPLETED
CANCELLED

Frontend chuyển sang tiếng Việt để hiển thị.
*/
const getStatusText = (status) => {
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
};


/*
=========================================================
ICON TRẠNG THÁI
=========================================================
*/
const getStatusIcon = (status) => {
    switch (status) {
        case "PENDING":
            return <Clock3 size={16} />;

        case "CONFIRMED":
            return <Check size={16} />;

        case "PROCESSING":
            return <Truck size={16} />;

        case "COMPLETED":
            return <Package size={16} />;

        case "CANCELLED":
            return <XCircle size={16} />;

        default:
            return <Clock3 size={16} />;
    }
};


/*
=========================================================
CLASS CSS CHO STATUS
=========================================================
*/
const getStatusClass = (status) => {
    switch (status) {
        case "PENDING":
            return "pending";

        case "CONFIRMED":
            return "confirmed";

        case "PROCESSING":
            return "processing";

        case "COMPLETED":
            return "completed";

        case "CANCELLED":
            return "cancelled";

        default:
            return "";
    }
};


/*
=========================================================
CÁC TRẠNG THÁI MÀ ADMIN ĐƯỢC CHUYỂN
=========================================================

PENDING:
→ CONFIRMED
→ CANCELLED

CONFIRMED:
→ PROCESSING
→ CANCELLED

PROCESSING:
→ COMPLETED

COMPLETED:
→ Không được thay đổi

CANCELLED:
→ Không được thay đổi
*/
const getNextStatuses = (status) => {
    switch (status) {
        case "PENDING":
            return [
                "CONFIRMED",
                "CANCELLED"
            ];

        case "CONFIRMED":
            return [
                "PROCESSING",
                "CANCELLED"
            ];

        case "PROCESSING":
            return [
                "COMPLETED"
            ];

        default:
            return [];
    }
};


/*
=========================================================
ADMIN ORDERS
=========================================================
*/
function AdminOrders() {

    /*
    -----------------------------------------------------
    STATE DANH SÁCH ĐƠN HÀNG
    -----------------------------------------------------
    */
    const [orders, setOrders] = useState([]);


    /*
    -----------------------------------------------------
    STATE LOADING
    -----------------------------------------------------
    */
    const [loading, setLoading] = useState(true);


    /*
    -----------------------------------------------------
    STATE ERROR
    -----------------------------------------------------
    */
    const [error, setError] = useState("");


    /*
    -----------------------------------------------------
    TỪ KHÓA TÌM KIẾM
    -----------------------------------------------------
    */
    const [search, setSearch] = useState("");


    /*
    -----------------------------------------------------
    BỘ LỌC TRẠNG THÁI
    -----------------------------------------------------
    */
    const [statusFilter, setStatusFilter] =
        useState("ALL");


    /*
    -----------------------------------------------------
    ĐƠN HÀNG ĐANG XEM CHI TIẾT
    -----------------------------------------------------
    */
    const [selectedOrder, setSelectedOrder] =
        useState(null);


    /*
    -----------------------------------------------------
    ID ĐƠN HÀNG ĐANG CẬP NHẬT
    -----------------------------------------------------
    Dùng để khóa dropdown trong lúc gọi API.
    */
    const [updatingId, setUpdatingId] =
        useState(null);


    /*
    =====================================================
    LOAD ORDERS
    =====================================================
    */
    const loadOrders = async () => {

        try {

            setLoading(true);
            setError("");

            /*
            Gọi API lấy danh sách đơn hàng.

            Với tài khoản Admin:
            backend sẽ trả về toàn bộ đơn hàng.
            */
            const data = await getMyOrders();

            /*
            Đảm bảo dữ liệu luôn là Array.
            */
            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Không thể tải đơn hàng:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải danh sách đơn hàng."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    =====================================================
    LOAD DỮ LIỆU KHI MỞ TRANG
    =====================================================
    */
    useEffect(() => {
        loadOrders();
    }, []);


    /*
    =====================================================
    TÍNH CÁC SỐ LIỆU THỐNG KÊ
    =====================================================
    */
    const summary = useMemo(() => {

        return {
            total: orders.length,

            pending: orders.filter(
                order =>
                    order.status === "PENDING"
            ).length,

            processing: orders.filter(
                order =>
                    order.status === "PROCESSING" ||
                    order.status === "CONFIRMED"
            ).length,

            completed: orders.filter(
                order =>
                    order.status === "COMPLETED"
            ).length,

            cancelled: orders.filter(
                order =>
                    order.status === "CANCELLED"
            ).length
        };

    }, [orders]);


    /*
    =====================================================
    SEARCH + FILTER
    =====================================================
    */
    const filteredOrders = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();

        return orders.filter(order => {

            /*
            ---------------------------------------------
            LẤY THÔNG TIN KHÁCH HÀNG
            ---------------------------------------------
            */
            const customer =
                order.customer || {};

            const customerName =
                customer.fullName ||
                order.shippingName ||
                "";

            const customerPhone =
                customer.phone ||
                order.shippingPhone ||
                "";

            /*
            ---------------------------------------------
            KIỂM TRA TỪ KHÓA
            ---------------------------------------------
            */
            const matchesSearch =
                !keyword ||
                String(order.id)
                    .toLowerCase()
                    .includes(keyword) ||
                customerName
                    .toLowerCase()
                    .includes(keyword) ||
                customerPhone
                    .toLowerCase()
                    .includes(keyword);


            /*
            ---------------------------------------------
            KIỂM TRA STATUS FILTER
            ---------------------------------------------
            */
            const matchesStatus =
                statusFilter === "ALL" ||
                order.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [
        orders,
        search,
        statusFilter
    ]);


    /*
    =====================================================
    CẬP NHẬT TRẠNG THÁI
    =====================================================
    */
    const handleStatusChange = async (
        order,
        newStatus
    ) => {

        /*
        Nếu chọn lại đúng trạng thái hiện tại
        thì không cần gọi API.
        */
        if (
            !newStatus ||
            newStatus === order.status
        ) {
            return;
        }


        /*
        Lấy tên trạng thái để hiển thị confirm.
        */
        const oldStatus =
            getStatusText(order.status);

        const nextStatus =
            getStatusText(newStatus);


        /*
        Nếu Admin chọn Hủy đơn,
        yêu cầu xác nhận trước khi thực hiện.
        */
        if (
            newStatus === "CANCELLED"
        ) {

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn chuyển đơn #${order.id} từ "${oldStatus}" sang "Đã hủy"?\n\nSản phẩm trong đơn sẽ được hoàn lại kho.`
                );

            if (!confirmed) {
                return;
            }
        }


        try {

            /*
            Đánh dấu đơn hàng đang được cập nhật.
            */
            setUpdatingId(order.id);


            /*
            Gọi API backend.
            */
            const updatedOrder =
                await updateOrderStatus(
                    order.id,
                    newStatus
                );


            /*
            Cập nhật đơn hàng trong state.

            Không cần load lại toàn bộ trang.
            */
            setOrders(prevOrders =>
                prevOrders.map(item =>
                    item.id === order.id
                        ? updatedOrder
                        : item
                )
            );


            /*
            Nếu modal chi tiết đang mở,
            cũng cập nhật dữ liệu trong modal.
            */
            setSelectedOrder(prev =>
                prev &&
                prev.id === order.id
                    ? updatedOrder
                    : prev
            );


            alert(
                `Cập nhật trạng thái đơn #${order.id} thành công!`
            );

        } catch (err) {

            console.error(
                "Cập nhật trạng thái thất bại:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Không thể cập nhật trạng thái đơn hàng."
            );

        } finally {

            setUpdatingId(null);

        }
    };


    /*
    =====================================================
    MỞ CHI TIẾT ĐƠN HÀNG
    =====================================================
    */
    const handleViewDetail = (order) => {
        setSelectedOrder(order);
    };


    /*
    =====================================================
    ĐÓNG MODAL
    =====================================================
    */
    const handleCloseDetail = () => {
        setSelectedOrder(null);
    };


    /*
    =====================================================
    RENDER
    =====================================================
    */
    return (

        <div className="admin-orders">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-orders-header">

                <div>
                    <h1>
                        Quản lý đơn hàng
                    </h1>

                    <p>
                        Theo dõi và xử lý các đơn hàng
                        của SmartSales
                    </p>
                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="order-summary-grid">

                {/* Tổng đơn */}

                <div className="order-summary-card">

                    <div className="summary-icon total">
                        <Package size={22} />
                    </div>

                    <div>
                        <span>
                            Tổng đơn hàng
                        </span>

                        <strong>
                            {summary.total}
                        </strong>
                    </div>

                </div>


                {/* Chờ xác nhận */}

                <div className="order-summary-card">

                    <div className="summary-icon pending">
                        <Clock3 size={22} />
                    </div>

                    <div>
                        <span>
                            Chờ xác nhận
                        </span>

                        <strong>
                            {summary.pending}
                        </strong>
                    </div>

                </div>


                {/* Đang xử lý */}

                <div className="order-summary-card">

                    <div className="summary-icon processing">
                        <Truck size={22} />
                    </div>

                    <div>
                        <span>
                            Đang xử lý
                        </span>

                        <strong>
                            {summary.processing}
                        </strong>
                    </div>

                </div>


                {/* Hoàn thành */}

                <div className="order-summary-card">

                    <div className="summary-icon completed">
                        <Check size={22} />
                    </div>

                    <div>
                        <span>
                            Hoàn thành
                        </span>

                        <strong>
                            {summary.completed}
                        </strong>
                    </div>

                </div>


                {/* Đã hủy */}

                <div className="order-summary-card">

                    <div className="summary-icon cancelled">
                        <XCircle size={22} />
                    </div>

                    <div>
                        <span>
                            Đã hủy
                        </span>

                        <strong>
                            {summary.cancelled}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="orders-toolbar">

                {/* SEARCH */}

                <div className="orders-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Tìm mã đơn, tên khách hàng, số điện thoại..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* STATUS FILTER */}

                <div className="orders-filter">

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            Tất cả trạng thái
                        </option>

                        <option value="PENDING">
                            Chờ xác nhận
                        </option>

                        <option value="CONFIRMED">
                            Đã xác nhận
                        </option>

                        <option value="PROCESSING">
                            Đang xử lý
                        </option>

                        <option value="COMPLETED">
                            Hoàn thành
                        </option>

                        <option value="CANCELLED">
                            Đã hủy
                        </option>

                    </select>

                    <ChevronDown
                        size={17}
                    />

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="orders-error">
                    {error}
                </div>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="orders-table-card">

                {loading ? (

                    <div className="orders-loading">
                        Đang tải danh sách đơn hàng...
                    </div>

                ) : filteredOrders.length === 0 ? (

                    <div className="orders-empty">

                        <Package
                            size={42}
                        />

                        <h3>
                            Không có đơn hàng
                        </h3>

                        <p>
                            Không tìm thấy đơn hàng
                            phù hợp với điều kiện tìm kiếm.
                        </p>

                    </div>

                ) : (

                    <div className="orders-table-wrapper">

                        <table className="orders-table">

                            <thead>

                            <tr>

                                <th>
                                    Mã đơn
                                </th>

                                <th>
                                    Khách hàng
                                </th>

                                <th>
                                    Ngày đặt
                                </th>

                                <th>
                                    Sản phẩm
                                </th>

                                <th>
                                    Tổng tiền
                                </th>

                                <th>
                                    Trạng thái
                                </th>

                                <th>
                                    Thao tác
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {filteredOrders.map(
                                order => {

                                    const customer =
                                        order.customer ||
                                        {};

                                    const customerName =
                                        customer.fullName ||
                                        order.shippingName ||
                                        "Khách hàng";

                                    const customerPhone =
                                        customer.phone ||
                                        order.shippingPhone ||
                                        "--";

                                    const details =
                                        Array.isArray(
                                            order.orderDetails
                                        )
                                            ? order.orderDetails
                                            : [];

                                    const productQuantity =
                                        details.reduce(
                                            (
                                                total,
                                                detail
                                            ) =>
                                                total +
                                                Number(
                                                    detail.quantity ||
                                                    0
                                                ),
                                            0
                                        );

                                    const nextStatuses =
                                        getNextStatuses(
                                            order.status
                                        );

                                    return (

                                        <tr
                                            key={
                                                order.id
                                            }
                                        >

                                            {/* MÃ ĐƠN */}

                                            <td>

                                                    <span className="order-id">
                                                        #
                                                        {
                                                            order.id
                                                        }
                                                    </span>

                                            </td>


                                            {/* KHÁCH HÀNG */}

                                            <td>

                                                <div className="customer-cell">

                                                    <strong>
                                                        {
                                                            customerName
                                                        }
                                                    </strong>

                                                    <span>
                                                            {
                                                                customerPhone
                                                            }
                                                        </span>

                                                </div>

                                            </td>


                                            {/* NGÀY ĐẶT */}

                                            <td>

                                                    <span className="order-date">
                                                        {
                                                            formatDateTime(
                                                                order.orderDate
                                                            )
                                                        }
                                                    </span>

                                            </td>


                                            {/* SẢN PHẨM */}

                                            <td>

                                                <div className="product-count">

                                                    <Package
                                                        size={15}
                                                    />

                                                    <span>
                                                            {
                                                                productQuantity
                                                            }{" "}
                                                        sản phẩm
                                                        </span>

                                                </div>

                                            </td>


                                            {/* TỔNG TIỀN */}

                                            <td>

                                                <strong className="order-total">
                                                    {
                                                        formatPrice(
                                                            order.totalAmount
                                                        )
                                                    }
                                                </strong>

                                            </td>


                                            {/* TRẠNG THÁI */}

                                            <td>

                                                <div className="status-action">

                                                    {nextStatuses.length >
                                                    0 ? (

                                                        <div className="status-select-wrapper">

                                                            <select
                                                                value=""
                                                                disabled={
                                                                    updatingId ===
                                                                    order.id
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleStatusChange(
                                                                        order,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >

                                                                <option
                                                                    value=""
                                                                >
                                                                    {
                                                                        getStatusText(
                                                                            order.status
                                                                        )
                                                                    }
                                                                </option>

                                                                {nextStatuses.map(
                                                                    status => (

                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            →
                                                                            {" "}
                                                                            {
                                                                                getStatusText(
                                                                                    status
                                                                                )
                                                                            }
                                                                        </option>

                                                                    )
                                                                )}

                                                            </select>

                                                            <ChevronDown
                                                                size={14}
                                                            />

                                                        </div>

                                                    ) : (

                                                        <span
                                                            className={`order-status ${getStatusClass(
                                                                order.status
                                                            )}`}
                                                        >

                                                                {
                                                                    getStatusIcon(
                                                                        order.status
                                                                    )
                                                                }

                                                            {
                                                                getStatusText(
                                                                    order.status
                                                                )
                                                            }

                                                            </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* THAO TÁC */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="order-view-button"
                                                    onClick={() =>
                                                        handleViewDetail(
                                                            order
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={16}
                                                    />

                                                    Xem

                                                </button>

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {selectedOrder && (

                <div
                    className="order-modal-overlay"
                    onMouseDown={
                        handleCloseDetail
                    }
                >

                    <div
                        className="order-detail-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="order-modal-header">

                            <div>

                                <span>
                                    Chi tiết đơn hàng
                                </span>

                                <h2>
                                    #
                                    {
                                        selectedOrder.id
                                    }
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    handleCloseDetail
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* MODAL CONTENT */}

                        <div className="order-modal-content">

                            {/* STATUS */}

                            <div className="detail-status-row">

                                <span>
                                    Trạng thái đơn hàng
                                </span>

                                <span
                                    className={`order-status ${getStatusClass(
                                        selectedOrder.status
                                    )}`}
                                >

                                    {
                                        getStatusIcon(
                                            selectedOrder.status
                                        )
                                    }

                                    {
                                        getStatusText(
                                            selectedOrder.status
                                        )
                                    }

                                </span>

                            </div>


                            {/* CUSTOMER INFO */}

                            <div className="detail-section">

                                <h3>
                                    Thông tin khách hàng
                                </h3>

                                <div className="detail-grid">

                                    <div>

                                        <span>
                                            Họ và tên
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.shippingName ||
                                                selectedOrder.customer?.fullName ||
                                                "--"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Số điện thoại
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.shippingPhone ||
                                                selectedOrder.customer?.phone ||
                                                "--"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.customer?.email ||
                                                "--"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Ngày đặt
                                        </span>

                                        <strong>
                                            {
                                                formatDateTime(
                                                    selectedOrder.orderDate
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* SHIPPING */}

                            <div className="detail-section">

                                <h3>
                                    Thông tin giao hàng
                                </h3>

                                <div className="shipping-info">

                                    <div>

                                        <span>
                                            Địa chỉ
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.shippingAddress ||
                                                "--"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Ghi chú
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.shippingNote ||
                                                "Không có ghi chú"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* PRODUCTS */}

                            <div className="detail-section">

                                <h3>
                                    Sản phẩm trong đơn
                                </h3>

                                <div className="detail-products">

                                    {(
                                        Array.isArray(
                                            selectedOrder.orderDetails
                                        )
                                            ? selectedOrder.orderDetails
                                            : []
                                    ).map(
                                        detail => {

                                            const product =
                                                detail.product ||
                                                {};

                                            return (

                                                <div
                                                    className="detail-product-row"
                                                    key={
                                                        detail.id
                                                    }
                                                >

                                                    {/* IMAGE */}

                                                    <div className="detail-product-image">

                                                        {product.imageUrl ? (

                                                            <img
                                                                src={
                                                                    product.imageUrl
                                                                }
                                                                alt={
                                                                    product.name ||
                                                                    "Sản phẩm"
                                                                }
                                                            />

                                                        ) : (

                                                            <Package
                                                                size={22}
                                                            />

                                                        )}

                                                    </div>


                                                    {/* NAME */}

                                                    <div className="detail-product-name">

                                                        <strong>
                                                            {
                                                                product.name ||
                                                                "Sản phẩm"
                                                            }
                                                        </strong>

                                                        <span>
                                                            x
                                                            {
                                                                detail.quantity
                                                            }
                                                        </span>

                                                    </div>


                                                    {/* PRICE */}

                                                    <div className="detail-product-price">

                                                        <span>
                                                            Đơn giá
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatPrice(
                                                                    detail.unitPrice
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    {/* SUBTOTAL */}

                                                    <div className="detail-product-subtotal">

                                                        <span>
                                                            Thành tiền
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatPrice(
                                                                    detail.subtotal
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                            </div>


                            {/* TOTAL */}

                            <div className="detail-total">

                                <span>
                                    Tổng thanh toán
                                </span>

                                <strong>
                                    {
                                        formatPrice(
                                            selectedOrder.totalAmount
                                        )
                                    }
                                </strong>

                            </div>


                            {/* STATUS ACTION */}

                            {getNextStatuses(
                                selectedOrder.status
                            ).length > 0 && (

                                <div className="detail-status-action">

                                    <span>
                                        Cập nhật trạng thái
                                    </span>

                                    <div className="detail-status-buttons">

                                        {getNextStatuses(
                                            selectedOrder.status
                                        ).map(
                                            status => (

                                                <button
                                                    key={
                                                        status
                                                    }
                                                    type="button"
                                                    className={
                                                        status ===
                                                        "CANCELLED"
                                                            ? "danger"
                                                            : "primary"
                                                    }
                                                    disabled={
                                                        updatingId ===
                                                        selectedOrder.id
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            selectedOrder,
                                                            status
                                                        )
                                                    }
                                                >

                                                    {
                                                        getStatusIcon(
                                                            status
                                                        )
                                                    }

                                                    {
                                                        getStatusText(
                                                            status
                                                        )
                                                    }

                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminOrders;