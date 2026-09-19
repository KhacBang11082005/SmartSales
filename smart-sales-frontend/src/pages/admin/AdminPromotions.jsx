import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Tag,
    X
} from "lucide-react";

import {
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion
} from "../../services/promotionApi";

import {
    getCategories
} from "../../services/categoryApi";

import {
    getProducts
} from "../../services/productApi";

import "./AdminPromotions.css";


// =========================================================
// FORM MẶC ĐỊNH
// =========================================================

const DEFAULT_FORM = {
    name: "",
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    maxDiscount: "",
    minOrderAmount: "0",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",

    // ALL / CATEGORY / PRODUCT
    scopeType: "ALL",

    // Danh sách ID danh mục
    categoryIds: [],

    // Danh sách ID sản phẩm
    productIds: []
};


// =========================================================
// ADMIN PROMOTIONS
// =========================================================

const AdminPromotions = () => {

    // =====================================================
    // DANH SÁCH KHUYẾN MẠI
    // =====================================================

    const [promotions, setPromotions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [searchKeyword, setSearchKeyword] = useState("");


    // =====================================================
    // CATEGORY / PRODUCT
    // =====================================================

    const [categories, setCategories] = useState([]);

    const [products, setProducts] = useState([]);


    // =====================================================
    // MODAL
    // =====================================================

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [saving, setSaving] = useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] = useState({
        ...DEFAULT_FORM
    });


    // =====================================================
    // LOAD PROMOTIONS
    // =====================================================

    const loadPromotions = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getPromotions();

            setPromotions(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "GET PROMOTIONS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách khuyến mại."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD CATEGORY + PRODUCT
    // =====================================================

    const loadPromotionOptions = async () => {

        try {

            const [categoryData, productData] = await Promise.all([
                getCategories(),
                getProducts()
            ]);

            setCategories(
                Array.isArray(categoryData)
                    ? categoryData
                    : []
            );

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : []
            );

        } catch (err) {

            console.error(
                "LOAD PROMOTION OPTIONS ERROR:",
                err
            );

            setError(
                "Không thể tải danh mục hoặc sản phẩm."
            );
        }
    };


    // =====================================================
    // LOAD LẦN ĐẦU
    // =====================================================

    useEffect(() => {

        loadPromotions();
        loadPromotionOptions();

    }, []);


    // =====================================================
    // FORMAT TIỀN
    // =====================================================

    const formatMoney = (value) => {

        return Number(value || 0).toLocaleString(
            "vi-VN"
        ) + " ₫";
    };


    // =====================================================
    // FORMAT NGÀY GIỜ
    // =====================================================

    const formatDateTime = (value) => {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString(
            "vi-VN"
        );
    };


    // =====================================================
    // HIỂN THỊ LOẠI GIẢM GIÁ
    // =====================================================

    const getDiscountText = (promotion) => {

        if (
            promotion.discountType === "PERCENT"
        ) {

            return `${promotion.discountValue}%`;
        }

        if (
            promotion.discountType === "FIXED"
        ) {

            return formatMoney(
                promotion.discountValue
            );
        }

        return "-";
    };


    // =====================================================
    // HIỂN THỊ PHẠM VI
    // =====================================================

    const getScopeText = (promotion) => {

        switch (promotion.scopeType) {

            case "ALL":
                return "Tất cả sản phẩm";

            case "CATEGORY":
                return "Theo danh mục";

            case "PRODUCT":
                return "Theo sản phẩm";

            default:
                return "-";
        }
    };


    // =====================================================
    // HIỂN THỊ TRẠNG THÁI
    // =====================================================

    const getStatusText = (status) => {

        switch (status) {

            case "ACTIVE":
                return "Đang hoạt động";

            case "INACTIVE":
                return "Ngừng hoạt động";

            default:
                return status || "-";
        }
    };


    // =====================================================
    // LỌC DANH SÁCH
    // =====================================================

    const filteredPromotions = useMemo(() => {

        const keyword =
            searchKeyword
                .trim()
                .toLowerCase();

        if (!keyword) {
            return promotions;
        }

        return promotions.filter(
            (promotion) => {

                const name =
                    String(
                        promotion.name || ""
                    ).toLowerCase();

                const code =
                    String(
                        promotion.code || ""
                    ).toLowerCase();

                return (
                    name.includes(keyword) ||
                    code.includes(keyword)
                );
            }
        );

    }, [
        promotions,
        searchKeyword
    ]);


    // =====================================================
    // MỞ FORM THÊM
    // =====================================================

    const handleOpenCreate = () => {

        setEditingId(null);

        setForm({
            ...DEFAULT_FORM
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };


    // =====================================================
    // CHUYỂN DATETIME TỪ BACKEND
    // SANG FORMAT CỦA INPUT DATETIME-LOCAL
    // =====================================================

    const convertToDateTimeLocal = (value) => {

        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };


    // =====================================================
    // MỞ FORM SỬA
    // =====================================================

    const handleOpenEdit = (promotion) => {

        setEditingId(
            promotion.id
        );

        setForm({
            name: promotion.name || "",

            code: promotion.code || "",

            discountType:
                promotion.discountType ||
                "PERCENT",

            discountValue:
                promotion.discountValue ??
                "",

            maxDiscount:
                promotion.maxDiscount ??
                "",

            minOrderAmount:
                promotion.minOrderAmount ??
                "0",

            usageLimit:
                promotion.usageLimit ??
                "",

            startDate:
                convertToDateTimeLocal(
                    promotion.startDate
                ),

            endDate:
                convertToDateTimeLocal(
                    promotion.endDate
                ),

            status:
                promotion.status ||
                "ACTIVE",

            scopeType:
                promotion.scopeType ||
                "ALL",

            categoryIds:
                Array.isArray(
                    promotion.categoryIds
                )
                    ? promotion.categoryIds
                    : [],

            productIds:
                Array.isArray(
                    promotion.productIds
                )
                    ? promotion.productIds
                    : []
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };


    // =====================================================
    // ĐÓNG FORM
    // =====================================================

    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingId(null);

        setForm({
            ...DEFAULT_FORM
        });
    };


    // =====================================================
    // THAY ĐỔI INPUT
    // =====================================================

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


    // =====================================================
    // CHỌN / BỎ CHỌN DANH MỤC
    // =====================================================

    const handleCategoryChange = (categoryId) => {

        setForm((prev) => {

            const exists =
                prev.categoryIds.includes(
                    categoryId
                );

            return {
                ...prev,

                categoryIds: exists
                    ? prev.categoryIds.filter(
                        (id) =>
                            id !== categoryId
                    )
                    : [
                        ...prev.categoryIds,
                        categoryId
                    ]
            };
        });
    };


    // =====================================================
    // CHỌN / BỎ CHỌN SẢN PHẨM
    // =====================================================

    const handleProductChange = (productId) => {

        setForm((prev) => {

            const exists =
                prev.productIds.includes(
                    productId
                );

            return {
                ...prev,

                productIds: exists
                    ? prev.productIds.filter(
                        (id) =>
                            id !== productId
                    )
                    : [
                        ...prev.productIds,
                        productId
                    ]
            };
        });
    };


    // =====================================================
    // KHI ĐỔI PHẠM VI
    // =====================================================

    const handleScopeChange = (e) => {

        const scopeType =
            e.target.value;

        setForm((prev) => ({
            ...prev,

            scopeType,

            // Chuyển phạm vi thì
            // xóa lựa chọn cũ
            categoryIds:
                scopeType === "CATEGORY"
                    ? prev.categoryIds
                    : [],

            productIds:
                scopeType === "PRODUCT"
                    ? prev.productIds
                    : []
        }));
    };


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {

        if (!form.name.trim()) {
            return "Vui lòng nhập tên chương trình.";
        }

        if (!form.code.trim()) {
            return "Vui lòng nhập mã khuyến mại.";
        }

        if (
            form.discountValue === "" ||
            Number(form.discountValue) < 0
        ) {
            return "Giá trị giảm giá không hợp lệ.";
        }

        if (
            form.discountType === "PERCENT" &&
            Number(form.discountValue) > 100
        ) {
            return "Giảm theo phần trăm không được vượt quá 100%.";
        }

        if (
            form.maxDiscount !== "" &&
            Number(form.maxDiscount) < 0
        ) {
            return "Mức giảm tối đa không hợp lệ.";
        }

        if (
            form.minOrderAmount === "" ||
            Number(form.minOrderAmount) < 0
        ) {
            return "Đơn hàng tối thiểu không hợp lệ.";
        }

        if (
            form.usageLimit === "" ||
            Number(form.usageLimit) <= 0
        ) {
            return "Giới hạn lượt sử dụng phải lớn hơn 0.";
        }

        if (!form.startDate) {
            return "Vui lòng chọn thời gian bắt đầu.";
        }

        if (!form.endDate) {
            return "Vui lòng chọn thời gian kết thúc.";
        }

        if (
            new Date(form.endDate) <=
            new Date(form.startDate)
        ) {
            return "Thời gian kết thúc phải sau thời gian bắt đầu.";
        }

        if (
            form.scopeType === "CATEGORY" &&
            form.categoryIds.length === 0
        ) {
            return "Vui lòng chọn ít nhất một danh mục.";
        }

        if (
            form.scopeType === "PRODUCT" &&
            form.productIds.length === 0
        ) {
            return "Vui lòng chọn ít nhất một sản phẩm.";
        }

        return null;
    };


    // =====================================================
    // SUBMIT FORM
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {

            setError(
                validationError
            );

            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const promotionData = {

                name:
                    form.name.trim(),

                code:
                    form.code
                        .trim()
                        .toUpperCase(),

                discountType:
                form.discountType,

                discountValue:
                    Number(
                        form.discountValue
                    ),

                maxDiscount:
                    form.maxDiscount === ""
                        ? null
                        : Number(
                            form.maxDiscount
                        ),

                minOrderAmount:
                    Number(
                        form.minOrderAmount
                    ),

                usageLimit:
                    Number(
                        form.usageLimit
                    ),

                startDate:
                form.startDate,

                endDate:
                form.endDate,

                status:
                form.status,

                scopeType:
                form.scopeType,

                categoryIds:
                    form.scopeType ===
                    "CATEGORY"
                        ? form.categoryIds
                        : [],

                productIds:
                    form.scopeType ===
                    "PRODUCT"
                        ? form.productIds
                        : []
            };


            // =================================================
            // UPDATE
            // =================================================

            if (editingId) {

                await updatePromotion(
                    editingId,
                    promotionData
                );

                setSuccess(
                    "Cập nhật chương trình khuyến mại thành công."
                );

            }

                // =================================================
                // CREATE
            // =================================================

            else {

                await createPromotion(
                    promotionData
                );

                setSuccess(
                    "Thêm chương trình khuyến mại thành công."
                );
            }


            // Đóng modal
            setShowModal(false);

            setEditingId(null);

            setForm({
                ...DEFAULT_FORM
            });


            // Load lại danh sách
            await loadPromotions();

        } catch (err) {

            console.error(
                "SAVE PROMOTION ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể lưu chương trình khuyến mại."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // XÓA KHUYẾN MẠI
    // =====================================================

    const handleDelete = async (promotion) => {

        const confirmed =
            window.confirm(
                `Bạn có chắc chắn muốn xóa chương trình "${promotion.name}" không?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            await deletePromotion(
                promotion.id
            );

            setSuccess(
                "Xóa chương trình khuyến mại thành công."
            );

            await loadPromotions();

        } catch (err) {

            console.error(
                "DELETE PROMOTION ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể xóa chương trình khuyến mại."
            );
        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-promotions-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-promotions-header">

                <div>

                    <h1>
                        Quản lý khuyến mại
                    </h1>

                    <p>
                        Quản lý các chương trình
                        khuyến mại của SmartSales
                    </p>

                </div>


                <button
                    type="button"
                    className="promotion-add-btn"
                    onClick={
                        handleOpenCreate
                    }
                >
                    <Plus size={18} />

                    Thêm khuyến mại
                </button>

            </div>


            {/* =================================================
                THÔNG BÁO
            ================================================= */}

            {success && (
                <div className="promotion-alert promotion-alert-success">
                    {success}
                </div>
            )}


            {error && !showModal && (
                <div className="promotion-alert promotion-alert-error">
                    {error}
                </div>
            )}


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="promotion-toolbar">

                <div className="promotion-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mã khuyến mại..."
                        value={searchKeyword}
                        onChange={(e) =>
                            setSearchKeyword(
                                e.target.value
                            )
                        }
                    />

                </div>


                <button
                    type="button"
                    className="promotion-refresh-btn"
                    onClick={
                        loadPromotions
                    }
                    disabled={loading}
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "promotion-spin"
                                : ""
                        }
                    />

                    Làm mới

                </button>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="promotion-table-wrapper">

                <table className="promotion-table">

                    <thead>

                    <tr>

                        <th>STT</th>

                        <th>
                            Chương trình
                        </th>

                        <th>Mã</th>

                        <th>Giảm giá</th>

                        <th>Phạm vi</th>

                        <th>
                            Đơn tối thiểu
                        </th>

                        <th>Sử dụng</th>

                        <th>Thời gian</th>

                        <th>
                            Trạng thái
                        </th>

                        <th>
                            Thao tác
                        </th>

                    </tr>

                    </thead>


                    <tbody>

                    {loading ? (

                        <tr>

                            <td
                                colSpan="10"
                                className="promotion-empty"
                            >
                                Đang tải dữ liệu...
                            </td>

                        </tr>

                    ) : filteredPromotions.length === 0 ? (

                        <tr>

                            <td
                                colSpan="10"
                                className="promotion-empty"
                            >

                                <Tag
                                    size={34}
                                    strokeWidth={1.5}
                                />

                                <span>
                                    Không có chương trình
                                    khuyến mại nào.
                                </span>

                            </td>

                        </tr>

                    ) : (

                        filteredPromotions.map(
                            (
                                promotion,
                                index
                            ) => (

                                <tr
                                    key={
                                        promotion.id
                                    }
                                >

                                    <td>
                                        {index + 1}
                                    </td>


                                    <td>

                                        <div className="promotion-name">

                                            <strong>
                                                {
                                                    promotion.name
                                                }
                                            </strong>

                                        </div>

                                    </td>


                                    <td>

                                        <span className="promotion-code">

                                            {
                                                promotion.code
                                            }

                                        </span>

                                    </td>


                                    <td>

                                        <strong className="promotion-discount">

                                            {
                                                getDiscountText(
                                                    promotion
                                                )
                                            }

                                        </strong>

                                    </td>


                                    <td>

                                        {
                                            getScopeText(
                                                promotion
                                            )
                                        }

                                    </td>


                                    <td>

                                        {
                                            formatMoney(
                                                promotion.minOrderAmount
                                            )
                                        }

                                    </td>


                                    <td>

                                        {
                                            promotion.usedCount
                                        }

                                        {" / "}

                                        {
                                            promotion.usageLimit
                                        }

                                    </td>


                                    <td>

                                        <div className="promotion-date">

                                            <span>
                                                {
                                                    formatDateTime(
                                                        promotion.startDate
                                                    )
                                                }
                                            </span>

                                            <span>
                                                →
                                            </span>

                                            <span>
                                                {
                                                    formatDateTime(
                                                        promotion.endDate
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </td>


                                    <td>

                                        <span
                                            className={
                                                promotion.status ===
                                                "ACTIVE"
                                                    ? "promotion-status promotion-status-active"
                                                    : "promotion-status promotion-status-inactive"
                                            }
                                        >

                                            {
                                                getStatusText(
                                                    promotion.status
                                                )
                                            }

                                        </span>

                                    </td>


                                    <td>

                                        <div className="promotion-actions">

                                            <button
                                                type="button"
                                                className="promotion-edit-btn"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    handleOpenEdit(
                                                        promotion
                                                    )
                                                }
                                            >

                                                <Pencil
                                                    size={17}
                                                />

                                            </button>


                                            <button
                                                type="button"
                                                className="promotion-delete-btn"
                                                title="Xóa"
                                                onClick={() =>
                                                    handleDelete(
                                                        promotion
                                                    )
                                                }
                                            >

                                                <Trash2
                                                    size={17}
                                                />

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            )
                        )
                    )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            {!loading &&
                filteredPromotions.length > 0 && (

                    <div className="promotion-table-footer">

                        Hiển thị{" "}
                        <strong>
                            {
                                filteredPromotions.length
                            }
                        </strong>{" "}
                        /{" "}
                        <strong>
                            {
                                promotions.length
                            }
                        </strong>{" "}
                        chương trình khuyến mại

                    </div>

                )}


            {/* =================================================
                MODAL THÊM / SỬA KHUYẾN MẠI
            ================================================= */}

            {showModal && (

                <div
                    className="promotion-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            handleCloseModal();
                        }

                    }}
                >

                    <div className="promotion-modal">

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="promotion-modal-header">

                            <div>

                                <h2>
                                    {editingId
                                        ? "Chỉnh sửa khuyến mại"
                                        : "Thêm khuyến mại"
                                    }
                                </h2>

                                <p>
                                    Thiết lập thông tin
                                    chương trình khuyến mại
                                </p>

                            </div>


                            <button
                                type="button"
                                className="promotion-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={saving}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="promotion-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =================================================
                                TÊN + MÃ
                            ================================================= */}

                            <div className="promotion-form-grid">

                                <div className="promotion-form-group">

                                    <label>
                                        Tên chương trình
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ví dụ: Khuyến mại tháng 9"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <div className="promotion-form-group">

                                    <label>
                                        Mã khuyến mại
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="code"
                                        value={
                                            form.code
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ví dụ: SMART9"
                                        style={{
                                            textTransform:
                                                "uppercase"
                                        }}
                                        disabled={
                                            saving ||
                                            (
                                                editingId &&
                                                promotions.find(
                                                    (p) =>
                                                        p.id ===
                                                        editingId
                                                )?.usedCount > 0
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                LOẠI GIẢM + GIÁ TRỊ
                            ================================================= */}

                            <div className="promotion-form-grid">

                                <div className="promotion-form-group">

                                    <label>
                                        Loại giảm giá
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="discountType"
                                        value={
                                            form.discountType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        <option value="PERCENT">
                                            Phần trăm (%)
                                        </option>

                                        <option value="FIXED">
                                            Số tiền (₫)
                                        </option>

                                    </select>

                                </div>


                                <div className="promotion-form-group">

                                    <label>
                                        Giá trị giảm
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={
                                            form.discountValue
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder={
                                            form.discountType ===
                                            "PERCENT"
                                                ? "Ví dụ: 10"
                                                : "Ví dụ: 50000"
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                GIẢM TỐI ĐA + ĐƠN TỐI THIỂU
                            ================================================= */}

                            <div className="promotion-form-grid">

                                <div className="promotion-form-group">

                                    <label>
                                        Giảm tối đa
                                    </label>

                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        value={
                                            form.maxDiscount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder={
                                            form.discountType ===
                                            "PERCENT"
                                                ? "Ví dụ: 100000"
                                                : "Không bắt buộc"
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                    <small>
                                        Có thể để trống nếu
                                        không giới hạn.
                                    </small>

                                </div>


                                <div className="promotion-form-group">

                                    <label>
                                        Đơn hàng tối thiểu
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={
                                            form.minOrderAmount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="Ví dụ: 500000"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                GIỚI HẠN SỬ DỤNG + TRẠNG THÁI
                            ================================================= */}

                            <div className="promotion-form-grid">

                                <div className="promotion-form-group">

                                    <label>
                                        Giới hạn lượt sử dụng
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={
                                            form.usageLimit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="1"
                                        step="1"
                                        placeholder="Ví dụ: 500"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <div className="promotion-form-group">

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
                                        disabled={
                                            saving
                                        }
                                    >

                                        <option value="ACTIVE">
                                            Đang hoạt động
                                        </option>

                                        <option value="INACTIVE">
                                            Ngừng hoạt động
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* =================================================
                                THỜI GIAN
                            ================================================= */}

                            <div className="promotion-form-grid">

                                <div className="promotion-form-group">

                                    <label>
                                        Thời gian bắt đầu
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <div className="promotion-form-group">

                                    <label>
                                        Thời gian kết thúc
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={
                                            form.endDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PHẠM VI
                            ================================================= */}

                            <div className="promotion-form-group">

                                <label>
                                    Phạm vi khuyến mại
                                    <span>*</span>
                                </label>

                                <select
                                    name="scopeType"
                                    value={
                                        form.scopeType
                                    }
                                    onChange={
                                        handleScopeChange
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <option value="ALL">
                                        Tất cả sản phẩm
                                    </option>

                                    <option value="CATEGORY">
                                        Theo danh mục
                                    </option>

                                    <option value="PRODUCT">
                                        Theo sản phẩm
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                CHỌN DANH MỤC
                            ================================================= */}

                            {form.scopeType ===
                                "CATEGORY" && (

                                    <div className="promotion-scope-box">

                                        <div className="promotion-scope-title">

                                            Chọn danh mục

                                            <span>
                                            *
                                        </span>

                                        </div>

                                        <div className="promotion-option-list">

                                            {categories.length === 0 ? (

                                                <div className="promotion-option-empty">
                                                    Không có danh mục.
                                                </div>

                                            ) : (

                                                categories.map(
                                                    (category) => {

                                                        const categoryId =
                                                            Number(
                                                                category.id
                                                            );

                                                        const checked =
                                                            form.categoryIds.includes(
                                                                categoryId
                                                            );

                                                        return (

                                                            <label
                                                                key={
                                                                    category.id
                                                                }
                                                                className={
                                                                    checked
                                                                        ? "promotion-option promotion-option-selected"
                                                                        : "promotion-option"
                                                                }
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    onChange={() =>
                                                                        handleCategoryChange(
                                                                            categoryId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />

                                                                <span>
                                                                {
                                                                    category.name
                                                                }
                                                            </span>

                                                            </label>

                                                        );
                                                    }
                                                )

                                            )}

                                        </div>

                                    </div>
                                )}


                            {/* =================================================
                                CHỌN SẢN PHẨM
                            ================================================= */}

                            {form.scopeType ===
                                "PRODUCT" && (

                                    <div className="promotion-scope-box">

                                        <div className="promotion-scope-title">

                                            Chọn sản phẩm

                                            <span>
                                            *
                                        </span>

                                        </div>

                                        <div className="promotion-option-list promotion-product-list">

                                            {products.length === 0 ? (

                                                <div className="promotion-option-empty">
                                                    Không có sản phẩm.
                                                </div>

                                            ) : (

                                                products.map(
                                                    (product) => {

                                                        const productId =
                                                            Number(
                                                                product.id
                                                            );

                                                        const checked =
                                                            form.productIds.includes(
                                                                productId
                                                            );

                                                        return (

                                                            <label
                                                                key={
                                                                    product.id
                                                                }
                                                                className={
                                                                    checked
                                                                        ? "promotion-option promotion-option-selected"
                                                                        : "promotion-option"
                                                                }
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    onChange={() =>
                                                                        handleProductChange(
                                                                            productId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        {
                                                                            formatMoney(
                                                                                product.price
                                                                            )
                                                                        }
                                                                    </small>

                                                                </div>

                                                            </label>

                                                        );
                                                    }
                                                )

                                            )}

                                        </div>

                                    </div>
                                )}


                            {/* =================================================
                                ERROR TRONG FORM
                            ================================================= */}

                            {error && showModal && (

                                <div className="promotion-form-error">

                                    {error}

                                </div>

                            )}


                            {/* =================================================
                                ACTION
                            ================================================= */}

                            <div className="promotion-form-actions">

                                <button
                                    type="button"
                                    className="promotion-form-cancel"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Hủy
                                </button>


                                <button
                                    type="submit"
                                    className="promotion-form-submit"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "Đang lưu..."
                                        : editingId
                                            ? "Lưu thay đổi"
                                            : "Thêm khuyến mại"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminPromotions;