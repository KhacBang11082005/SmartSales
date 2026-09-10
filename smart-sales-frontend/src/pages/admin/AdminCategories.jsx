import { useEffect, useMemo, useState } from "react";
import {
    Edit3,
    FolderTree,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoryApi";

import "./AdminCategories.css";


const EMPTY_FORM = {
    name: "",
    description: "",
    status: "ACTIVE"
};


function AdminCategories() {

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    /* =====================================================
       LOAD CATEGORY
    ===================================================== */

    const loadCategories = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getCategories();

            setCategories(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error(
                "Lỗi tải danh mục:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Không thể tải danh sách danh mục."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadCategories();

    }, []);


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredCategories = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();


        if (!keyword) {

            return categories;

        }


        return categories.filter(
            (category) =>
                category.name
                    ?.toLowerCase()
                    .includes(keyword) ||

                category.description
                    ?.toLowerCase()
                    .includes(keyword)
        );

    }, [categories, search]);


    /* =====================================================
       ADD
    ===================================================== */

    const handleAdd = () => {

        setEditingId(null);

        setForm({
            ...EMPTY_FORM
        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (category) => {

        setEditingId(category.id);

        setForm({

            name:
                category.name || "",

            description:
                category.description || "",

            status:
                category.status || "ACTIVE"

        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleCloseModal = () => {

        if (saving) return;

        setShowModal(false);

        setEditingId(null);

        setForm({
            ...EMPTY_FORM
        });

        setError("");

    };


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm((prev) => ({

            ...prev,

            [name]: value

        }));

    };


    /* =====================================================
       SAVE
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!form.name.trim()) {

            setError(
                "Vui lòng nhập tên danh mục."
            );

            return;

        }


        try {

            setSaving(true);

            setError("");


            const categoryData = {

                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                status:
                form.status

            };


            if (editingId) {

                await updateCategory(
                    editingId,
                    categoryData
                );

                setSuccess(
                    "Cập nhật danh mục thành công."
                );

            } else {

                await createCategory(
                    categoryData
                );

                setSuccess(
                    "Thêm danh mục thành công."
                );

            }


            setShowModal(false);

            setEditingId(null);

            setForm({
                ...EMPTY_FORM
            });


            await loadCategories();


            setTimeout(() => {

                setSuccess("");

            }, 3000);

        } catch (err) {

            console.error(
                "Lưu danh mục thất bại:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Không thể lưu danh mục."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (category) => {

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn xóa danh mục "${category.name}" không?`
            );


        if (!confirmed) return;


        try {

            setDeletingId(category.id);

            setError("");


            await deleteCategory(
                category.id
            );


            setSuccess(
                "Xóa danh mục thành công."
            );


            await loadCategories();


            setTimeout(() => {

                setSuccess("");

            }, 3000);

        } catch (err) {

            console.error(
                "Xóa danh mục thất bại:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Không thể xóa danh mục. Có thể danh mục đang được sử dụng bởi sản phẩm."
            );

        } finally {

            setDeletingId(null);

        }

    };


    /* =====================================================
       STATUS
    ===================================================== */

    const getStatus = (status) => {

        if (status === "ACTIVE") {

            return {

                text: "Hoạt động",

                className:
                    "category-status-active"

            };

        }


        return {

            text: "Ngừng hoạt động",

            className:
                "category-status-inactive"

        };

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="admin-categories">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="category-page-header">

                <div>

                    <div className="category-title-row">

                        <h1>
                            Danh mục
                        </h1>

                    </div>


                    <p>
                        Quản lý các nhóm sản phẩm của cửa hàng
                    </p>

                </div>


                <button
                    className="category-add-btn"
                    onClick={handleAdd}
                >

                    <Plus size={17} />

                    <span>
                        Thêm danh mục
                    </span>

                </button>

            </div>


            {/* =================================================
                ALERT
            ================================================= */}

            {error && !showModal && (

                <div className="category-alert category-alert-error">

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >

                        <X size={16} />

                    </button>

                </div>

            )}


            {success && (

                <div className="category-alert category-alert-success">

                    <span>
                        {success}
                    </span>

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                    >

                        <X size={16} />

                    </button>

                </div>

            )}


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="category-toolbar">

                <div className="category-search">

                    <Search
                        size={17}
                    />

                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="category-search-clear"
                        >

                            <X size={15} />

                        </button>

                    )}

                </div>


                <div className="category-result-count">

                    <span>
                        Hiển thị
                    </span>

                    <strong>
                        {filteredCategories.length}
                    </strong>

                    <span>
                        / {categories.length} danh mục
                    </span>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="category-table-container">

                {loading ? (

                    <div className="category-loading">

                        <LoaderCircle
                            size={28}
                            className="category-spinner"
                        />

                        <span>
                            Đang tải danh mục...
                        </span>

                    </div>

                ) : filteredCategories.length === 0 ? (

                    <div className="category-empty">

                        <div className="category-empty-icon">

                            <FolderTree size={32} />

                        </div>


                        <h3>
                            Chưa có danh mục
                        </h3>


                        <p>
                            Không tìm thấy danh mục phù hợp.
                        </p>


                        {!search && (

                            <button
                                onClick={handleAdd}
                                className="category-empty-btn"
                            >

                                <Plus size={16} />

                                Thêm danh mục

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="category-table-scroll">

                        <table className="category-table">

                            <thead>

                            <tr>

                                <th className="category-col-id">
                                    ID
                                </th>

                                <th className="category-col-name">
                                    Danh mục
                                </th>

                                <th className="category-col-description">
                                    Mô tả
                                </th>

                                <th className="category-col-status">
                                    Trạng thái
                                </th>

                                <th className="category-col-actions">
                                    Thao tác
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {filteredCategories.map(
                                (category) => {

                                    const status =
                                        getStatus(
                                            category.status
                                        );


                                    return (

                                        <tr
                                            key={category.id}
                                        >

                                            {/* ID */}

                                            <td>

                                                    <span className="category-id">
                                                        #{category.id}
                                                    </span>

                                            </td>


                                            {/* NAME */}

                                            <td>

                                                <div className="category-name-cell">




                                                    <div>

                                                        <strong>
                                                            {category.name}
                                                        </strong>


                                                    </div>

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td>

                                                <div className="category-description">

                                                    {category.description ||
                                                        "Chưa có mô tả"}

                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                    <span
                                                        className={`category-status ${status.className}`}
                                                    >

                                                        <span className="category-status-dot" />

                                                        {status.text}

                                                    </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <div className="category-actions">

                                                    <button
                                                        type="button"
                                                        className="category-action-btn category-edit-btn"
                                                        title="Chỉnh sửa"
                                                        onClick={() =>
                                                            handleEdit(
                                                                category
                                                            )
                                                        }
                                                    >

                                                        <Edit3
                                                            size={15}
                                                        />

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="category-action-btn category-delete-btn"
                                                        title="Xóa"
                                                        disabled={
                                                            deletingId ===
                                                            category.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                    >

                                                        {deletingId ===
                                                        category.id ? (

                                                            <LoaderCircle
                                                                size={15}
                                                                className="category-spinner"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        )}

                                                    </button>

                                                </div>

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
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="category-modal-overlay"
                    onMouseDown={handleCloseModal}
                >

                    <div
                        className="category-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="category-modal-header">

                            <div className="category-modal-title">

                                <div className="category-modal-icon">

                                    {editingId ? (
                                        <Edit3 size={18} />
                                    ) : (
                                        <Plus size={19} />
                                    )}

                                </div>


                                <div>

                                    <h2>
                                        {editingId
                                            ? "Chỉnh sửa danh mục"
                                            : "Thêm danh mục"}
                                    </h2>

                                    <p>
                                        {editingId
                                            ? "Cập nhật thông tin danh mục"
                                            : "Tạo danh mục sản phẩm mới"}
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="category-close-btn"
                                onClick={handleCloseModal}
                                disabled={saving}
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="category-form-body">


                                {error && (

                                    <div className="category-form-error">

                                        <span>
                                            {error}
                                        </span>

                                    </div>

                                )}


                                {/* NAME */}

                                <div className="category-form-group">

                                    <label>

                                        Tên danh mục

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Laptop, Điện thoại..."
                                        disabled={saving}
                                        autoFocus
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="category-form-group">

                                    <label>
                                        Mô tả
                                    </label>


                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập mô tả ngắn cho danh mục..."
                                        rows="3"
                                        disabled={saving}
                                    />

                                </div>


                                {/* STATUS */}

                                <div className="category-form-group">

                                    <label>
                                        Trạng thái
                                    </label>


                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                    >

                                        <option value="ACTIVE">
                                            Hoạt động
                                        </option>

                                        <option value="INACTIVE">
                                            Ngừng hoạt động
                                        </option>

                                    </select>

                                </div>


                            </div>


                            {/* FOOTER */}

                            <div className="category-modal-footer">

                                <button
                                    type="button"
                                    className="category-cancel-btn"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={saving}
                                >
                                    Hủy
                                </button>


                                <button
                                    type="submit"
                                    className="category-save-btn"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>

                                            <LoaderCircle
                                                size={16}
                                                className="category-spinner"
                                            />

                                            Đang lưu...

                                        </>

                                    ) : (

                                        <>

                                            {editingId ? (
                                                <Edit3 size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}

                                            {editingId
                                                ? "Lưu thay đổi"
                                                : "Thêm danh mục"}

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


export default AdminCategories;