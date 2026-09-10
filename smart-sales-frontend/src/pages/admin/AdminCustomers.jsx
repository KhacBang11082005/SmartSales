import React, { useEffect, useMemo, useState } from "react";
import {
    Edit3,
    Eye,
    LoaderCircle,
    Search,
    Trash2,
    X,
    UserRound,
    Phone,
    Mail,
    CalendarDays,
    ShoppingBag,
    ShieldCheck
} from "lucide-react";

import {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from "../../services/customerApi";

import "./AdminCustomers.css";

const EMPTY_FORM = {
    fullName: "",
    phone: "",
    status: "ACTIVE"
};

const STATUS_CONFIG = {
    ACTIVE: {
        label: "Hoạt động",
        className: "status-active"
    },
    INACTIVE: {
        label: "Không hoạt động",
        className: "status-inactive"
    },
    LOCKED: {
        label: "Đã khóa",
        className: "status-locked"
    }
};

const formatDate = (date) => {
    if (!date) return "—";

    try {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch {
        return "—";
    }
};

const formatMoney = (value) => {
    if (value === null || value === undefined) return "0 ₫";

    return Number(value).toLocaleString("vi-VN") + " ₫";
};

const getStatusConfig = (status) => {
    return (
        STATUS_CONFIG[String(status || "").toUpperCase()] || {
            label: status || "Không xác định",
            className: ""
        }
    );
};

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showEdit, setShowEdit] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // LOAD CUSTOMERS
    // =========================
    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCustomers();

            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi lấy danh sách khách hàng:", err);
            setError("Không thể tải danh sách khách hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // =========================
    // SEARCH + FILTER
    // =========================
    const filteredCustomers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesSearch =
                !keyword ||
                String(customer.fullName || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(customer.username || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(customer.email || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(customer.phone || "")
                    .toLowerCase()
                    .includes(keyword);

            const customerStatus = String(
                customer.status || ""
            ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                customerStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    // =========================
    // DETAIL
    // =========================
    const handleView = async (customer) => {
        try {
            setError("");

            const data = await getCustomerById(customer.id);

            setSelectedCustomer(data);
            setShowDetail(true);
        } catch (err) {
            console.error("Lỗi xem khách hàng:", err);
            setError("Không thể tải thông tin khách hàng.");
        }
    };

    // =========================
    // EDIT
    // =========================
    const handleEdit = async (customer) => {
        try {
            setError("");

            const data = await getCustomerById(customer.id);

            setEditingCustomer(data);

            setForm({
                fullName: data.fullName || "",
                phone: data.phone || "",
                status: String(data.status || "ACTIVE").toUpperCase()
            });

            setShowEdit(true);
        } catch (err) {
            console.error("Lỗi lấy thông tin khách hàng:", err);
            setError("Không thể lấy thông tin khách hàng.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingCustomer) return;

        if (!form.fullName.trim()) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        if (!form.phone.trim()) {
            setError("Vui lòng nhập số điện thoại.");
            return;
        }

        if (!form.status) {
            setError("Vui lòng chọn trạng thái khách hàng.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const updatedCustomer = await updateCustomer(
                editingCustomer.id,
                {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    status: form.status
                }
            );

            setCustomers((prev) =>
                prev.map((customer) =>
                    customer.id === editingCustomer.id
                        ? {
                            ...customer,
                            ...updatedCustomer
                        }
                        : customer
                )
            );

            setEditingCustomer(updatedCustomer);

            setShowEdit(false);

            setSuccess("Cập nhật thông tin khách hàng thành công.");

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error("Lỗi cập nhật khách hàng:", err);

            setError(
                err?.response?.data?.message ||
                "Không thể cập nhật thông tin khách hàng."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (customer) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa khách hàng "${customer.fullName || customer.username}" không?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");

            await deleteCustomer(customer.id);

            setCustomers((prev) =>
                prev.filter((item) => item.id !== customer.id)
            );

            setSuccess("Xóa khách hàng thành công.");

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error("Lỗi xóa khách hàng:", err);

            setError(
                err?.response?.data?.message ||
                "Không thể xóa khách hàng."
            );
        } finally {
            setDeleting(false);
        }
    };

    const closeDetail = () => {
        setShowDetail(false);
        setSelectedCustomer(null);
    };

    const closeEdit = () => {
        if (saving) return;

        setShowEdit(false);
        setEditingCustomer(null);
        setForm(EMPTY_FORM);
    };

    return (
        <div className="admin-customers">
            {/* =========================
                HEADER
            ========================= */}
            <div className="customer-page-header">
                <div>
                    <h1>Quản lý khách hàng</h1>
                    <p>
                        Quản lý thông tin và trạng thái tài khoản khách hàng
                    </p>
                </div>

                <div className="customer-total">
                    <UserRound size={18} />
                    <span>{customers.length} khách hàng</span>
                </div>
            </div>

            {/* =========================
                ALERT
            ========================= */}
            {error && (
                <div className="customer-alert customer-alert-error">
                    <span>{error}</span>

                    <button onClick={() => setError("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="customer-alert customer-alert-success">
                    <span>{success}</span>

                    <button onClick={() => setSuccess("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =========================
                TOOLBAR
            ========================= */}
            <div className="customer-toolbar">
                <div className="customer-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Tìm theo tên, username, email, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                        >
                            <X size={17} />
                        </button>
                    )}
                </div>

                <select
                    className="customer-status-filter"
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">
                        Không hoạt động
                    </option>
                    <option value="LOCKED">Đã khóa</option>
                </select>
            </div>

            {/* =========================
                TABLE
            ========================= */}
            <div className="customer-table-wrapper">
                {loading ? (
                    <div className="customer-loading">
                        <LoaderCircle
                            size={32}
                            className="customer-spinner"
                        />
                        <span>Đang tải danh sách khách hàng...</span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="customer-empty">
                        <UserRound size={45} />
                        <h3>Không tìm thấy khách hàng</h3>
                        <p>
                            Không có khách hàng phù hợp với điều kiện tìm kiếm.
                        </p>
                    </div>
                ) : (
                    <table className="customer-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Trạng thái</th>
                            <th>Ngày đăng ký</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredCustomers.map((customer) => {
                            const status = getStatusConfig(
                                customer.status
                            );

                            return (
                                <tr key={customer.id}>
                                    <td>
                                            <span className="customer-id">
                                                #{customer.id}
                                            </span>
                                    </td>

                                    <td>
                                        <div className="customer-name-cell">
                                            <div className="customer-avatar">
                                                {(customer.fullName ||
                                                    customer.username ||
                                                    "K")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {customer.fullName ||
                                                        "Chưa cập nhật"}
                                                </strong>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        {customer.username || "—"}
                                    </td>

                                    <td>
                                        {customer.email || "—"}
                                    </td>

                                    <td>
                                        {customer.phone || "—"}
                                    </td>

                                    <td>
                                            <span
                                                className={`customer-status-badge ${status.className}`}
                                            >
                                                <span className="status-dot" />
                                                {status.label}
                                            </span>
                                    </td>

                                    <td>
                                        {formatDate(
                                            customer.createdAt
                                        )}
                                    </td>

                                    <td>
                                        <div className="customer-actions">
                                            <button
                                                className="customer-action-btn customer-action-view"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    handleView(customer)
                                                }
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                className="customer-action-btn customer-action-edit"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    handleEdit(customer)
                                                }
                                            >
                                                <Edit3 size={17} />
                                            </button>

                                            <button
                                                className="customer-action-btn customer-action-delete"
                                                title="Xóa"
                                                disabled={deleting}
                                                onClick={() =>
                                                    handleDelete(customer)
                                                }
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* =========================
                DETAIL MODAL
            ========================= */}
            {showDetail && selectedCustomer && (
                <div
                    className="customer-modal-overlay"
                    onMouseDown={closeDetail}
                >
                    <div
                        className="customer-modal customer-detail-modal"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="customer-modal-header">
                            <div>
                                <h2>Chi tiết khách hàng</h2>
                                <p>
                                    Thông tin tài khoản và lịch sử mua hàng
                                </p>
                            </div>

                            <button
                                className="customer-modal-close"
                                onClick={closeDetail}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="customer-modal-body">
                            <div className="customer-profile-card">
                                <div className="customer-profile-avatar">
                                    {(
                                        selectedCustomer.fullName ||
                                        selectedCustomer.username ||
                                        "K"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="customer-profile-content">
                                    <h3>
                                        {selectedCustomer.fullName ||
                                            "Chưa cập nhật"}
                                    </h3>

                                    <p>
                                        @{selectedCustomer.username || "—"}
                                    </p>

                                    <span
                                        className={`customer-status-badge ${
                                            getStatusConfig(
                                                selectedCustomer.status
                                            ).className
                                        }`}
                                    >
                                        <span className="status-dot" />
                                        {
                                            getStatusConfig(
                                                selectedCustomer.status
                                            ).label
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="customer-detail-grid">
                                <div className="customer-detail-item">
                                    <Mail size={18} />
                                    <div>
                                        <span>Email</span>
                                        <strong>
                                            {selectedCustomer.email || "—"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="customer-detail-item">
                                    <Phone size={18} />
                                    <div>
                                        <span>Số điện thoại</span>
                                        <strong>
                                            {selectedCustomer.phone || "—"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="customer-detail-item">
                                    <CalendarDays size={18} />
                                    <div>
                                        <span>Ngày đăng ký</span>
                                        <strong>
                                            {formatDate(
                                                selectedCustomer.createdAt
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className="customer-detail-item">
                                    <ShieldCheck size={18} />
                                    <div>
                                        <span>Vai trò</span>
                                        <strong>
                                            {selectedCustomer.role || "CUSTOMER"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="customer-order-history">
                                <div className="customer-section-title">
                                    <ShoppingBag size={19} />
                                    <h3>Lịch sử mua hàng</h3>
                                </div>

                                {selectedCustomer.orders?.length > 0 ? (
                                    <div className="customer-orders-list">
                                        {selectedCustomer.orders.map(
                                            (order) => (
                                                <div
                                                    className="customer-order-item"
                                                    key={order.id}
                                                >
                                                    <div className="customer-order-main">
                                                        <strong>
                                                            Đơn hàng #
                                                            {order.id}
                                                        </strong>

                                                        <span>
                                                            {formatDate(
                                                                order.orderDate
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="customer-order-quantity">
                                                        {order.productQuantity ||
                                                            0}{" "}
                                                        sản phẩm
                                                    </div>

                                                    <div className="customer-order-total">
                                                        {formatMoney(
                                                            order.totalAmount
                                                        )}
                                                    </div>

                                                    <span className="customer-order-status">
                                                        {order.status || "—"}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="customer-no-orders">
                                        <ShoppingBag size={35} />
                                        <span>
                                            Khách hàng chưa có đơn hàng nào.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="customer-modal-footer">
                            <button
                                className="customer-btn customer-btn-secondary"
                                onClick={closeDetail}
                            >
                                Đóng
                            </button>

                            <button
                                className="customer-btn customer-btn-primary"
                                onClick={() => {
                                    closeDetail();
                                    handleEdit(selectedCustomer);
                                }}
                            >
                                <Edit3 size={17} />
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                EDIT MODAL
            ========================= */}
            {showEdit && editingCustomer && (
                <div
                    className="customer-modal-overlay"
                    onMouseDown={closeEdit}
                >
                    <div
                        className="customer-modal customer-edit-modal"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="customer-modal-header customer-edit-header">
                            <div className="customer-edit-title">
                                <div className="customer-edit-icon">
                                    <Edit3 size={21} />
                                </div>

                                <div>
                                    <h2>Chỉnh sửa khách hàng</h2>
                                    <p>
                                        Cập nhật thông tin tài khoản khách hàng
                                    </p>
                                </div>
                            </div>

                            <button
                                className="customer-modal-close"
                                onClick={closeEdit}
                                disabled={saving}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            className="customer-edit-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="customer-modal-body">
                                {/* THÔNG TIN TÀI KHOẢN */}
                                <div className="customer-form-section">
                                    <div className="customer-form-section-title">
                                        <UserRound size={18} />
                                        <div>
                                            <h3>Thông tin tài khoản</h3>
                                            <span>
                                                Username và email chỉ được xem
                                            </span>
                                        </div>
                                    </div>

                                    <div className="customer-readonly-grid">
                                        <div className="customer-form-group">
                                            <label>Username</label>

                                            <div className="customer-input-readonly">
                                                <UserRound size={17} />

                                                <input
                                                    type="text"
                                                    value={
                                                        editingCustomer.username ||
                                                        ""
                                                    }
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div className="customer-form-group">
                                            <label>Email</label>

                                            <div className="customer-input-readonly">
                                                <Mail size={17} />

                                                <input
                                                    type="email"
                                                    value={
                                                        editingCustomer.email ||
                                                        ""
                                                    }
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* THÔNG TIN CÓ THỂ SỬA */}
                                <div className="customer-form-section">
                                    <div className="customer-form-section-title">
                                        <Edit3 size={18} />
                                        <div>
                                            <h3>Thông tin chỉnh sửa</h3>
                                            <span>
                                                Các thông tin bên dưới có thể
                                                thay đổi
                                            </span>
                                        </div>
                                    </div>

                                    {/* HỌ VÀ TÊN */}
                                    <div className="customer-form-group">
                                        <label>
                                            Họ và tên
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <div className="customer-input-wrapper">
                                            <UserRound size={17} />

                                            <input
                                                type="text"
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                placeholder="Nhập họ và tên..."
                                                disabled={saving}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    {/* SỐ ĐIỆN THOẠI */}
                                    <div className="customer-form-group">
                                        <label>
                                            Số điện thoại
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <div className="customer-input-wrapper">
                                            <Phone size={17} />

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="Nhập số điện thoại..."
                                                disabled={saving}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    {/* TRẠNG THÁI */}
                                    <div className="customer-form-group">
                                        <label>
                                            Trạng thái khách hàng
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <div className="customer-select-wrapper">
                                            <ShieldCheck size={17} />

                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                disabled={saving}
                                            >
                                                <option value="ACTIVE">
                                                    Hoạt động
                                                </option>

                                                <option value="INACTIVE">
                                                    Không hoạt động
                                                </option>

                                                <option value="LOCKED">
                                                    Đã khóa
                                                </option>
                                            </select>
                                        </div>

                                        <div className="customer-status-help">
                                            <span
                                                className={`customer-status-badge ${
                                                    getStatusConfig(
                                                        form.status
                                                    ).className
                                                }`}
                                            >
                                                <span className="status-dot" />
                                                {
                                                    getStatusConfig(
                                                        form.status
                                                    ).label
                                                }
                                            </span>

                                            <span>
                                                Trạng thái hiện tại của tài
                                                khoản khách hàng
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="customer-modal-footer customer-edit-footer">
                                <button
                                    type="button"
                                    className="customer-btn customer-btn-secondary"
                                    onClick={closeEdit}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="customer-btn customer-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="customer-spinner"
                                            />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={17} />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}