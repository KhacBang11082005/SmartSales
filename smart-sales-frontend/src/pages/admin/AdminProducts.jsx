import {
    Edit3,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    createProduct,
    deleteProduct,
    getAdminProducts,
    updateProduct
} from "../../services/adminProductApi";

import {
    getCategories
} from "../../services/categoryApi";

import "./AdminProducts.css";


/* =========================================================
   FORMAT GIÁ
========================================================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "0 ₫";
    }

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(price) + " ₫";

}


/* =========================================================
   FORM MẶC ĐỊNH
========================================================= */

const emptyForm = {

    name: "",

    categoryId: "",

    description: "",

    price: "",

    quantity: 0,

    imageUrl: "",

    status: "ACTIVE"

};


/* =========================================================
   ADMIN PRODUCTS
========================================================= */

function AdminProducts() {

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);


    /* =====================================================
       LOAD PRODUCTS + CATEGORIES
    ===================================================== */

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                productsData,
                categoriesData
            ] = await Promise.all([

                getAdminProducts(),

                getCategories()

            ]);


            setProducts(
                Array.isArray(productsData)
                    ? productsData
                    : []
            );


            setCategories(
                Array.isArray(categoriesData)
                    ? categoriesData
                    : []
            );


        } catch (err) {

            console.error(
                "Không thể tải dữ liệu:",
                err
            );

            setError(
                "Không thể tải danh sách sản phẩm."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    const filteredProducts = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();


        return products.filter(product => {

            const matchesSearch =
                !keyword ||
                product.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.description
                    ?.toLowerCase()
                    .includes(keyword);


            const matchesCategory =
                categoryFilter === "ALL" ||
                String(
                    product.category?.id
                ) === String(categoryFilter);


            return (
                matchesSearch &&
                matchesCategory
            );

        });

    }, [
        products,
        search,
        categoryFilter
    ]);


    /* =====================================================
       MỞ FORM THÊM
    ===================================================== */

    const handleAdd = () => {

        setEditingId(null);

        setForm({
            ...emptyForm,

            categoryId:
                categories.length > 0
                    ? categories[0].id
                    : ""
        });

        setShowModal(true);

        setError("");

    };


    /* =====================================================
       MỞ FORM SỬA
    ===================================================== */

    const handleEdit = (product) => {

        setEditingId(product.id);

        setForm({

            name: product.name || "",

            categoryId:
                product.category?.id || "",

            description:
                product.description || "",

            price:
                product.price ?? "",

            quantity:
                product.quantity ?? 0,

            imageUrl:
                product.imageUrl || "",

            status:
                product.status || "ACTIVE"

        });

        setShowModal(true);

        setError("");

    };


    /* =====================================================
       ĐÓNG FORM
    ===================================================== */

    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingId(null);

        setForm(emptyForm);

    };


    /* =====================================================
       HANDLE CHANGE
    ===================================================== */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm(prev => ({

            ...prev,

            [name]: value

        }));

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!form.name.trim()) {

            alert(
                "Vui lòng nhập tên sản phẩm."
            );

            return;

        }


        if (!form.categoryId) {

            alert(
                "Vui lòng chọn danh mục."
            );

            return;

        }


        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {

            alert(
                "Giá sản phẩm không hợp lệ."
            );

            return;

        }


        if (
            form.quantity === "" ||
            Number(form.quantity) < 0
        ) {

            alert(
                "Số lượng không hợp lệ."
            );

            return;

        }


        try {

            setSaving(true);


            const productData = {

                category: {

                    id: Number(
                        form.categoryId
                    )

                },

                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                quantity:
                    Number(form.quantity),

                imageUrl:
                    form.imageUrl.trim() ||
                    null,

                status:
                form.status

            };


            if (editingId) {

                await updateProduct(
                    editingId,
                    productData
                );

                alert(
                    "Cập nhật sản phẩm thành công!"
                );

            } else {

                await createProduct(
                    productData
                );

                alert(
                    "Thêm sản phẩm thành công!"
                );

            }


            await loadData();

            handleCloseModal();


        } catch (err) {

            console.error(
                "Lưu sản phẩm thất bại:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Không thể lưu sản phẩm."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (product) => {

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteProduct(
                product.id
            );


            setProducts(prev =>
                prev.filter(
                    item =>
                        item.id !== product.id
                )
            );


            alert(
                "Xóa sản phẩm thành công!"
            );


        } catch (err) {

            console.error(
                "Xóa sản phẩm thất bại:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Không thể xóa sản phẩm."
            );

        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="admin-products-loading">

                <LoaderCircle
                    size={30}
                    className="admin-products-spinner"
                />

                <span>
                    Đang tải sản phẩm...
                </span>

            </div>

        );

    }


    return (

        <div className="admin-products">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-products-header">

                <div>

                    <span className="admin-page-label">
                        QUẢN LÝ
                    </span>

                    <h1>
                        Sản phẩm
                    </h1>

                    <p>
                        Quản lý toàn bộ sản phẩm
                        trong hệ thống Smart Sales.
                    </p>

                </div>


                <button
                    className="admin-primary-button"
                    onClick={handleAdd}
                >

                    <Plus size={18} />

                    Thêm sản phẩm

                </button>

            </div>



            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="admin-products-error">

                    {error}

                </div>

            )}



            {/* =================================================
                FILTER
            ================================================= */}

            <div className="admin-products-toolbar">

                <div className="admin-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={categoryFilter}
                    onChange={event =>
                        setCategoryFilter(
                            event.target.value
                        )
                    }
                    className="admin-filter-select"
                >

                    <option value="ALL">
                        Tất cả danh mục
                    </option>


                    {categories.map(
                        category => (

                            <option
                                key={category.id}
                                value={category.id}
                            >

                                {category.name}

                            </option>

                        )
                    )}

                </select>

            </div>



            {/* =================================================
                TABLE
            ================================================= */}

            <div className="admin-products-table-wrapper">

                <table className="admin-products-table">

                    <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Sản phẩm
                        </th>

                        <th>
                            Danh mục
                        </th>

                        <th>
                            Giá
                        </th>

                        <th>
                            Số lượng
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

                    {filteredProducts.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                className="admin-products-empty"
                            >

                                Không tìm thấy sản phẩm.

                            </td>

                        </tr>

                    ) : (

                        filteredProducts.map(
                            product => (

                                <tr
                                    key={
                                        product.id
                                    }
                                >

                                    {/* ID */}

                                    <td>

                                            <span className="admin-product-id">

                                                #{product.id}

                                            </span>

                                    </td>



                                    {/* PRODUCT */}

                                    <td>

                                        <div className="admin-product-info">

                                            <div className="admin-product-image">

                                                {product.imageUrl ? (

                                                    <img
                                                        src={
                                                            product.imageUrl
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                    />

                                                ) : (

                                                    <span>
                                                            📦
                                                        </span>

                                                )}

                                            </div>


                                            <div>

                                                <strong>

                                                    {product.name}

                                                </strong>

                                                <span>

                                                        {product.description ||
                                                            "Không có mô tả"
                                                        }

                                                    </span>

                                            </div>

                                        </div>

                                    </td>



                                    {/* CATEGORY */}

                                    <td>

                                            <span className="admin-category-badge">

                                                {
                                                    product
                                                        .category
                                                        ?.name
                                                    ||
                                                    "Chưa phân loại"
                                                }

                                            </span>

                                    </td>



                                    {/* PRICE */}

                                    <td>

                                        <strong className="admin-product-price">

                                            {formatPrice(
                                                product.price
                                            )}

                                        </strong>

                                    </td>



                                    {/* QUANTITY */}

                                    <td>

                                            <span
                                                className={
                                                    Number(
                                                        product.quantity
                                                    ) <= 0
                                                        ? "admin-stock out"
                                                        : Number(
                                                            product.quantity
                                                        ) <= 5
                                                            ? "admin-stock low"
                                                            : "admin-stock"
                                                }
                                            >

                                                {product.quantity ?? 0}

                                            </span>

                                    </td>



                                    {/* STATUS */}

                                    <td>

                                            <span
                                                className={
                                                    `admin-status ${
                                                        product.status ===
                                                        "ACTIVE"
                                                            ? "active"
                                                            : "inactive"
                                                    }`
                                                }
                                            >

                                                {product.status ===
                                                "ACTIVE"
                                                    ? "Đang bán"
                                                    : "Ngừng bán"
                                                }

                                            </span>

                                    </td>



                                    {/* ACTION */}

                                    <td>

                                        <div className="admin-product-actions">

                                            <button
                                                className="admin-action-edit"
                                                title="Sửa"
                                                onClick={() =>
                                                    handleEdit(
                                                        product
                                                    )
                                                }
                                            >

                                                <Edit3
                                                    size={17}
                                                />

                                            </button>


                                            <button
                                                className="admin-action-delete"
                                                title="Xóa"
                                                onClick={() =>
                                                    handleDelete(
                                                        product
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
                COUNT
            ================================================= */}

            <div className="admin-products-count">

                Hiển thị{" "}
                <strong>
                    {filteredProducts.length}
                </strong>{" "}
                /{" "}
                <strong>
                    {products.length}
                </strong>{" "}
                sản phẩm

            </div>



            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="admin-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseModal();

                        }

                    }}
                >

                    <div className="admin-product-modal">


                        {/* MODAL HEADER */}

                        <div className="admin-modal-header">

                            <div>

                                <span>
                                    {editingId
                                        ? "CẬP NHẬT"
                                        : "THÊM MỚI"
                                    }
                                </span>

                                <h2>

                                    {editingId
                                        ? "Sửa sản phẩm"
                                        : "Thêm sản phẩm"
                                    }

                                </h2>

                            </div>


                            <button
                                className="admin-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>



                        {/* FORM */}

                        <form
                            className="admin-product-form"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* NAME */}

                            <div className="admin-form-group">

                                <label>
                                    Tên sản phẩm
                                    <span>*</span>
                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nhập tên sản phẩm"
                                />

                            </div>



                            {/* CATEGORY */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label>
                                        Danh mục
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="categoryId"
                                        value={
                                            form.categoryId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            -- Chọn danh mục --
                                        </option>


                                        {categories.map(
                                            category => (

                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >

                                                    {
                                                        category.name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>



                                {/* STATUS */}

                                <div className="admin-form-group">

                                    <label>
                                        Trạng thái
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
                                            Đang bán
                                        </option>

                                        <option value="INACTIVE">
                                            Ngừng bán
                                        </option>

                                    </select>

                                </div>

                            </div>



                            {/* PRICE + QUANTITY */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label>
                                        Giá bán
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Số lượng
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        step="1"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                </div>

                            </div>



                            {/* IMAGE */}

                            <div className="admin-form-group">

                                <label>
                                    URL hình ảnh
                                </label>

                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={
                                        form.imageUrl
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://..."
                                />

                            </div>



                            {/* DESCRIPTION */}

                            <div className="admin-form-group">

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
                                    rows="4"
                                    placeholder="Nhập mô tả sản phẩm..."
                                />

                            </div>



                            {/* FOOTER */}

                            <div className="admin-modal-footer">

                                <button
                                    type="button"
                                    className="admin-cancel-button"
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
                                    className="admin-primary-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="admin-products-spinner"
                                            />

                                            Đang lưu...

                                        </>

                                    ) : (

                                        <>
                                            {editingId
                                                ? "Lưu thay đổi"
                                                : "Thêm sản phẩm"
                                            }
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


export default AdminProducts;