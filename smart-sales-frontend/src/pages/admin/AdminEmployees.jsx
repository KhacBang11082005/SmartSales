import React, { useEffect, useMemo, useState } from "react";
import {
    Edit3,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X,
    UsersRound,
    ShieldCheck
} from "lucide-react";

import {
    getEmployees,
    createUser,
    updateUser,
    deleteUser
} from "../../services/userApi";

import { getEmployeeRoles } from "../../services/roleApi";

import "./AdminEmployees.css";

// =====================================================
// FORM MẶC ĐỊNH
// Không còn username vì nhân viên đăng nhập bằng email.
// =====================================================
const EMPTY_FORM = {
    fullName: "",
    email: "",
    password: "",
    roleName: "EMPLOYEE",
    status: "ACTIVE"
};

// =====================================================
// CẤU HÌNH TRẠNG THÁI
// =====================================================
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

// =====================================================
// CẤU HÌNH ROLE
// =====================================================
const ROLE_CONFIG = {
    ADMIN: {
        label: "ADMIN",
        className: "role-admin"
    },
    EMPLOYEE: {
        label: "EMPLOYEE",
        className: "role-employee"
    }
};

// =====================================================
// LẤY TÊN ROLE
// =====================================================
const getRoleName = (user) => {
    if (user?.role?.name) {
        return String(user.role.name).toUpperCase();
    }

    if (user?.roleName) {
        return String(user.roleName).toUpperCase();
    }

    return "";
};

// =====================================================
// LẤY CẤU HÌNH STATUS
// =====================================================
const getStatusConfig = (status) => {
    return (
        STATUS_CONFIG[String(status || "").toUpperCase()] || {
            label: status || "Không xác định",
            className: ""
        }
    );
};

// =====================================================
// LẤY CẤU HÌNH ROLE
// =====================================================
const getRoleConfig = (role) => {
    return (
        ROLE_CONFIG[String(role || "").toUpperCase()] || {
            label: role || "Không xác định",
            className: ""
        }
    );
};

// =====================================================
// FORMAT NGÀY
// =====================================================
const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

// =====================================================
// COMPONENT
// =====================================================
export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LẤY DANH SÁCH NHÂN VIÊN
    // =====================================================
    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getEmployees();

            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi lấy danh sách nhân viên:", err);

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Không thể tải danh sách nhân viên."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LẤY ROLE ADMIN / EMPLOYEE
    // CUSTOMER KHÔNG ĐƯỢC HIỂN THỊ Ở ĐÂY
    // =====================================================
    const loadRoles = async () => {
        try {
            const data = await getEmployeeRoles();

            const validRoles = Array.isArray(data) ? data : [];

            setRoles(validRoles);

            // Nếu database có EMPLOYEE thì mặc định chọn EMPLOYEE.
            if (validRoles.length > 0) {
                const hasEmployee = validRoles.some(
                    (role) =>
                        String(role?.name || "").toUpperCase() ===
                        "EMPLOYEE"
                );

                if (!hasEmployee) {
                    setForm((prev) => ({
                        ...prev,
                        roleName: String(
                            validRoles[0]?.name || ""
                        ).toUpperCase()
                    }));
                }
            }
        } catch (err) {
            console.error("Lỗi lấy role:", err);

            // Nếu API role lỗi vẫn cho phép dùng ADMIN / EMPLOYEE.
            setRoles([]);
        }
    };

    // =====================================================
    // LOAD DỮ LIỆU KHI MỞ TRANG
    // =====================================================
    useEffect(() => {
        loadEmployees();
        loadRoles();
    }, []);

    // =====================================================
    // TÌM KIẾM + LỌC
    // =====================================================
    const filteredEmployees = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return employees.filter((employee) => {
            const roleName = getRoleName(employee);
            const status = String(
                employee.status || ""
            ).toUpperCase();

            const matchesSearch =
                !keyword ||
                String(employee.fullName || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(employee.email || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchesRole =
                roleFilter === "ALL" ||
                roleName === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [
        employees,
        searchTerm,
        roleFilter,
        statusFilter
    ]);

    // =====================================================
    // MỞ FORM THÊM NHÂN VIÊN
    // =====================================================
    const handleAdd = () => {
        setError("");
        setSuccess("");
        setEditingEmployee(null);

        const hasEmployee = roles.some(
            (role) =>
                String(role?.name || "").toUpperCase() ===
                "EMPLOYEE"
        );

        setForm({
            ...EMPTY_FORM,
            roleName: hasEmployee
                ? "EMPLOYEE"
                : "ADMIN"
        });

        setShowForm(true);
    };

    // =====================================================
    // MỞ FORM SỬA NHÂN VIÊN
    // =====================================================
    const handleEdit = (employee) => {
        setError("");
        setSuccess("");

        setEditingEmployee(employee);

        setForm({
            fullName: employee.fullName || "",
            email: employee.email || "",

            // Để trống = giữ mật khẩu cũ.
            password: "",

            roleName:
                getRoleName(employee) || "EMPLOYEE",

            status:
                String(
                    employee.status || "ACTIVE"
                ).toUpperCase()
        });

        setShowForm(true);
    };

    // =====================================================
    // ĐÓNG FORM
    // =====================================================
    const handleCloseForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingEmployee(null);
        setForm(EMPTY_FORM);
    };

    // =====================================================
    // THAY ĐỔI INPUT
    // =====================================================
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =====================================================
    // THÊM / SỬA NHÂN VIÊN
    // =====================================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        const fullName = form.fullName.trim();
        const email = form.email.trim();
        const password = form.password.trim();
        const roleName = form.roleName
            .trim()
            .toUpperCase();

        // Kiểm tra họ tên
        if (!fullName) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        // Kiểm tra email
        if (!email) {
            setError("Vui lòng nhập email.");
            return;
        }

        // Kiểm tra email cơ bản
        if (
            !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(
                email
            )
        ) {
            setError("Email không hợp lệ.");
            return;
        }

        // Khi thêm mới bắt buộc có mật khẩu.
        // Khi sửa có thể để trống để giữ mật khẩu cũ.
        if (!editingEmployee && !password) {
            setError(
                "Vui lòng nhập mật khẩu khi tạo nhân viên."
            );
            return;
        }

        // Kiểm tra role
        if (
            !roleName ||
            !["ADMIN", "EMPLOYEE"].includes(roleName)
        ) {
            setError(
                "Vui lòng chọn ADMIN hoặc EMPLOYEE."
            );
            return;
        }

        // Kiểm tra status
        if (!form.status) {
            setError(
                "Vui lòng chọn trạng thái."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            // =================================================
            // PAYLOAD GỬI BACKEND
            //
            // Không gửi username.
            // Backend sẽ tự đặt:
            // username = email
            //
            // Ví dụ:
            // email = abc@gmail.com
            // => username nội bộ = abc@gmail.com
            // =================================================
            const payload = {
                email,
                fullName,

                role: {
                    name: roleName
                },

                status: form.status
            };

            // Chỉ gửi password nếu người dùng nhập.
            if (password) {
                payload.password = password;
            }

            // =================================================
            // CẬP NHẬT
            // =================================================
            if (editingEmployee) {
                const updatedEmployee =
                    await updateUser(
                        editingEmployee.id,
                        payload
                    );

                setEmployees((prev) =>
                    prev.map((employee) =>
                        employee.id ===
                        editingEmployee.id
                            ? {
                                ...employee,
                                ...updatedEmployee
                            }
                            : employee
                    )
                );

                setSuccess(
                    "Cập nhật nhân viên thành công."
                );
            }

                // =================================================
                // THÊM MỚI
            // =================================================
            else {
                const newEmployee =
                    await createUser(payload);

                setEmployees((prev) => [
                    newEmployee,
                    ...prev
                ]);

                setSuccess(
                    "Thêm nhân viên thành công."
                );
            }

            setShowForm(false);
            setEditingEmployee(null);
            setForm(EMPTY_FORM);

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error(
                "Lỗi lưu nhân viên:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Không thể lưu thông tin nhân viên."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // XÓA NHÂN VIÊN
    // =====================================================
    const handleDelete = async (employee) => {
        const roleName = getRoleName(employee);

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa tài khoản "${employee.email || employee.fullName}" không?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await deleteUser(employee.id);

            setEmployees((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== employee.id
                )
            );

            setSuccess(
                roleName === "ADMIN"
                    ? "Xóa tài khoản ADMIN thành công."
                    : "Xóa nhân viên thành công."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error(
                "Lỗi xóa nhân viên:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Không thể xóa nhân viên."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // THỐNG KÊ
    // =====================================================
    const activeCount = employees.filter(
        (employee) =>
            String(
                employee.status || ""
            ).toUpperCase() === "ACTIVE"
    ).length;

    const adminCount = employees.filter(
        (employee) =>
            getRoleName(employee) === "ADMIN"
    ).length;

    const employeeCount = employees.filter(
        (employee) =>
            getRoleName(employee) === "EMPLOYEE"
    ).length;

    return (
        <div className="admin-employees">

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="employee-page-header">
                <div>
                    <h1>Quản lý nhân viên</h1>

                    <p>
                        Quản lý tài khoản ADMIN và
                        EMPLOYEE trong hệ thống.
                    </p>
                </div>

                <div className="employee-header-actions">

                    <div className="employee-total">
                        <UsersRound size={17} />

                        <span>
                            {employees.length} tài khoản
                        </span>
                    </div>

                    <button
                        type="button"
                        className="employee-add-button"
                        onClick={handleAdd}
                    >
                        <Plus size={18} />

                        <span>
                            Thêm nhân viên
                        </span>
                    </button>
                </div>
            </div>

            {/* =================================================
                THÔNG BÁO LỖI
            ================================================= */}
            {error && (
                <div className="employee-alert employee-alert-error">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Đóng thông báo lỗi"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =================================================
                THÔNG BÁO THÀNH CÔNG
            ================================================= */}
            {success && (
                <div className="employee-alert employee-alert-success">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        aria-label="Đóng thông báo thành công"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}
            <div className="employee-summary">

                <div className="employee-summary-card">
                    <span>Tổng tài khoản</span>
                    <strong>
                        {employees.length}
                    </strong>
                </div>

                <div className="employee-summary-card">
                    <span>Đang hoạt động</span>
                    <strong>
                        {activeCount}
                    </strong>
                </div>

                <div className="employee-summary-card">
                    <span>ADMIN</span>
                    <strong>
                        {adminCount}
                    </strong>
                </div>

                <div className="employee-summary-card">
                    <span>EMPLOYEE</span>
                    <strong>
                        {employeeCount}
                    </strong>
                </div>

            </div>

            {/* =================================================
                TOOLBAR
            ================================================= */}
            <div className="employee-toolbar">

                <div className="employee-search">
                    <Search size={18} />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                        placeholder="Tìm theo họ tên hoặc email..."
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearchTerm("")
                            }
                            aria-label="Xóa tìm kiếm"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <select
                    className="employee-filter"
                    value={roleFilter}
                    onChange={(event) =>
                        setRoleFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="ALL">
                        Tất cả vai trò
                    </option>

                    <option value="ADMIN">
                        ADMIN
                    </option>

                    <option value="EMPLOYEE">
                        EMPLOYEE
                    </option>
                </select>

                <select
                    className="employee-filter"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="ALL">
                        Tất cả trạng thái
                    </option>

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

            {/* =================================================
                TABLE
            ================================================= */}
            <div className="employee-table-wrapper">

                {loading ? (
                    <div className="employee-loading">

                        <LoaderCircle
                            className="employee-spinner"
                            size={28}
                        />

                        <span>
                            Đang tải danh sách nhân viên...
                        </span>

                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="employee-empty">

                        <UsersRound size={42} />

                        <h3>
                            Không có nhân viên
                        </h3>

                        <p>
                            Không tìm thấy tài khoản
                            phù hợp với điều kiện
                            tìm kiếm.
                        </p>

                    </div>
                ) : (
                    <table className="employee-table">

                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nhân viên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>

                        {filteredEmployees.map(
                            (employee) => {

                                const role =
                                    getRoleConfig(
                                        getRoleName(
                                            employee
                                        )
                                    );

                                const status =
                                    getStatusConfig(
                                        employee.status
                                    );

                                return (
                                    <tr
                                        key={
                                            employee.id
                                        }
                                    >

                                        <td className="employee-id">
                                            #
                                            {
                                                employee.id
                                            }
                                        </td>

                                        <td>
                                            <div className="employee-name-cell">

                                                <div className="employee-avatar">
                                                    {String(
                                                        employee.fullName ||
                                                        "N"
                                                    )
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            employee.fullName
                                                        }
                                                    </strong>

                                                    <small>
                                                        Tài khoản nhân viên
                                                    </small>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                                <span className="employee-email">
                                                    {
                                                        employee.email ||
                                                        "—"
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`employee-role-badge ${role.className}`}
                                                >
                                                    <ShieldCheck
                                                        size={14}
                                                    />

                                                    {
                                                        role.label
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`employee-status-badge ${status.className}`}
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {
                                                formatDate(
                                                    employee.createdAt
                                                )
                                            }
                                        </td>

                                        <td>
                                            <div className="employee-actions">

                                                <button
                                                    type="button"
                                                    className="employee-edit-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            employee
                                                        )
                                                    }
                                                    title="Sửa"
                                                >
                                                    <Edit3
                                                        size={17}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="employee-delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            employee
                                                        )
                                                    }
                                                    disabled={
                                                        deleting
                                                    }
                                                    title="Xóa"
                                                >
                                                    <Trash2
                                                        size={17}
                                                    />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                );
                            }
                        )}

                        </tbody>

                    </table>
                )}

            </div>

            {/* =================================================
                MODAL THÊM / SỬA
            ================================================= */}
            {showForm && (
                <div
                    className="employee-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCloseForm();
                        }
                    }}
                >

                    <div className="employee-modal">

                        {/* HEADER MODAL */}
                        <div className="employee-modal-header">

                            <div>
                                <h2>
                                    {editingEmployee
                                        ? "Sửa nhân viên"
                                        : "Thêm nhân viên"}
                                </h2>

                                <p>
                                    {editingEmployee
                                        ? "Cập nhật thông tin tài khoản nhân viên."
                                        : "Tạo tài khoản nhân viên mới."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseForm
                                }
                                disabled={saving}
                                className="employee-modal-close"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="employee-form"
                        >

                            {/* HỌ TÊN */}
                            <div className="employee-form-group">
                                <label>
                                    Họ và tên
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={
                                        form.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nhập họ và tên"
                                    autoFocus
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="employee-form-group">
                                <label>
                                    Email
                                    <span>*</span>
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="example@gmail.com"
                                />

                                <small>
                                    Email được sử dụng
                                    để đăng nhập hệ thống.
                                </small>
                            </div>

                            {/* MẬT KHẨU */}
                            <div className="employee-form-group">
                                <label>
                                    Mật khẩu
                                    {!editingEmployee && (
                                        <span>*</span>
                                    )}
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={
                                        form.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder={
                                        editingEmployee
                                            ? "Để trống nếu không đổi mật khẩu"
                                            : "Nhập mật khẩu"
                                    }
                                />

                                {editingEmployee && (
                                    <small>
                                        Để trống nếu muốn
                                        giữ mật khẩu hiện tại.
                                    </small>
                                )}
                            </div>

                            {/* VAI TRÒ */}
                            <div className="employee-form-row">

                                <div className="employee-form-group">
                                    <label>
                                        Vai trò
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="roleName"
                                        value={
                                            form.roleName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            -- Chọn vai trò --
                                        </option>

                                        {roles.length >
                                        0 ? (
                                            roles.map(
                                                (role) => (
                                                    <option
                                                        key={
                                                            role.id ||
                                                            role.name
                                                        }
                                                        value={String(
                                                            role.name
                                                        ).toUpperCase()}
                                                    >
                                                        {String(
                                                            role.name
                                                        ).toUpperCase()}
                                                    </option>
                                                )
                                            )
                                        ) : (
                                            <>
                                                <option value="ADMIN">
                                                    ADMIN
                                                </option>

                                                <option value="EMPLOYEE">
                                                    EMPLOYEE
                                                </option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* TRẠNG THÁI */}
                                <div className="employee-form-group">
                                    <label>
                                        Trạng thái
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
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

                            </div>

                            {/* GHI CHÚ */}
                            <div className="employee-login-note">
                                <ShieldCheck
                                    size={17}
                                />

                                <span>
                                    Nhân viên sẽ đăng nhập
                                    bằng <strong>email</strong>{" "}
                                    và mật khẩu.
                                </span>
                            </div>

                            {/* BUTTON */}
                            <div className="employee-form-actions">

                                <button
                                    type="button"
                                    className="employee-cancel-button"
                                    onClick={
                                        handleCloseForm
                                    }
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="employee-save-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="employee-spinner"
                                            />

                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={17}
                                            />

                                            {editingEmployee
                                                ? "Lưu thay đổi"
                                                : "Thêm nhân viên"}
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