import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
    ShoppingCart,
    Minus,
    Plus,
    ArrowLeft
} from "lucide-react";

import { useCart } from "../../context/CartContext";

import { getProductById } from "../../services/productApi";

import "./ProductDetail.css";


/* ==========================================
   FORMAT GIÁ TIỀN
========================================== */

function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(price) + " ₫";

}


/* ==========================================
   PRODUCT DETAIL
========================================== */

function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { addToCart } = useCart();

    const {
        isLoggedIn
    } = useAuth();


    /* ==========================================
       STATE
    ========================================== */

    const [showSuccess, setShowSuccess] = useState(false);

    const [product, setProduct] = useState(null);

    const [quantity, setQuantity] = useState(1);

    /*
     * Giá trị tạm thời đang nhập trong ô số lượng.
     *
     * Cho phép người dùng xóa hết số thành ô trống.
     */
    const [editingQuantity, setEditingQuantity] = useState(null);

    /*
     * Lưu số lượng trước khi bắt đầu chỉnh sửa.
     *
     * Ví dụ đang là 14 → lưu 14.
     *
     * Nếu xóa hết rồi click ra ngoài
     * mà không nhập gì → quay lại 14.
     */
    const [originalQuantity, setOriginalQuantity] = useState(1);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =========================
       GET PRODUCT
    ========================= */

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                setLoading(true);

                const data =
                    await getProductById(id);

                console.log(
                    "📦 PRODUCT DETAIL:",
                    data
                );

                setProduct(data);

                /*
                 * Khi tải sản phẩm:
                 * số lượng mặc định là 1.
                 */
                setQuantity(1);

                setEditingQuantity(null);

                setOriginalQuantity(1);

            } catch (error) {

                console.error(
                    "❌ Không thể lấy sản phẩm:",
                    error
                );

                setError(
                    "Không thể tải thông tin sản phẩm."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProduct();

    }, [id]);


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="product-loading">

                Đang tải sản phẩm...

            </div>
        );

    }


    /* =========================
       ERROR
    ========================= */

    if (error || !product) {

        return (

            <div className="product-not-found">

                <h2>
                    {error ||
                        "Không tìm thấy sản phẩm"}
                </h2>

                <Link to="/products">

                    <ArrowLeft size={18} />

                    Quay lại sản phẩm

                </Link>

            </div>

        );

    }


    /* ==========================================
       BẮT ĐẦU CHỈNH SỬA SỐ LƯỢNG
    ========================================== */

    const handleQuantityFocus = () => {

        /*
         * Lưu số lượng hiện tại trước khi
         * người dùng bắt đầu sửa.
         */
        setOriginalQuantity(quantity);

        /*
         * Chuyển quantity sang dạng chuỗi
         * để input có thể nhận giá trị rỗng.
         */
        setEditingQuantity(
            String(quantity)
        );

    };


    /* ==========================================
       NHẬP TRỰC TIẾP SỐ LƯỢNG
    ========================================== */

    const handleQuantityChange = (value) => {

        /*
         * Chỉ cho phép nhập số.
         */
        if (!/^\d*$/.test(value)) {
            return;
        }

        /*
         * Lưu giá trị đang nhập.
         *
         * Có thể là:
         *
         * ""
         * "1"
         * "15"
         * "100"
         */
        setEditingQuantity(value);


        /*
         * Nếu xóa hết số:
         *
         * Không cập nhật quantity.
         *
         * Cho phép ô input thực sự trống.
         */
        if (value === "") {
            return;
        }


        let newQuantity = Number(value);


        /*
         * Không cho nhập 0.
         *
         * Nhưng vẫn cho phép ô tạm thời
         * hiển thị 0 trong lúc nhập.
         */
        if (newQuantity === 0) {
            return;
        }


        /*
         * Không cho vượt quá tồn kho.
         */
        if (
            newQuantity >
            Number(product.quantity || 0)
        ) {

            newQuantity =
                Number(product.quantity || 0);

            setEditingQuantity(
                String(newQuantity)
            );

        }


        /*
         * Cập nhật số lượng.
         */
        setQuantity(newQuantity);

    };


    /* ==========================================
       RỜI KHỎI INPUT
    ========================================== */

    const handleQuantityBlur = (value) => {

        /*
         * Nếu người dùng xóa hết số
         * nhưng không nhập gì
         *
         * → quay lại số lượng trước đó.
         */
        if (value === "") {

            setQuantity(
                originalQuantity
            );

            setEditingQuantity(null);

            return;

        }


        let newQuantity = Number(value);


        /*
         * Nếu nhập không hợp lệ
         * hoặc nhỏ hơn 1
         *
         * → quay lại số lượng trước đó.
         */
        if (
            !Number.isInteger(newQuantity) ||
            newQuantity < 1
        ) {

            newQuantity =
                originalQuantity;

        }


        /*
         * Không vượt quá tồn kho.
         */
        if (
            newQuantity >
            Number(product.quantity || 0)
        ) {

            newQuantity =
                Number(product.quantity || 0);

        }


        setQuantity(newQuantity);

        setEditingQuantity(null);

    };


    /* ==========================================
       GIẢM SỐ LƯỢNG
    ========================================== */

    const handleDecrease = () => {

        /*
         * Xóa trạng thái nhập tạm.
         */
        setEditingQuantity(null);

        setQuantity(prev =>
            Math.max(
                1,
                prev - 1
            )
        );

    };


    /* ==========================================
       TĂNG SỐ LƯỢNG
    ========================================== */

    const handleIncrease = () => {

        /*
         * Xóa trạng thái nhập tạm.
         */
        setEditingQuantity(null);

        setQuantity(prev =>
            Math.min(
                Number(product.quantity || 0),
                prev + 1
            )
        );

    };


    /* =========================
       ADD CART
    ========================= */

    const handleAddToCart = () => {

        // =========================
        // CHƯA ĐĂNG NHẬP
        // =========================

        if (!isLoggedIn) {

            navigate("/login", {
                state: {
                    from: `/products/${product.id}`
                }
            });

            return;

        }


        // =========================
        // HẾT HÀNG
        // =========================

        if (product.quantity <= 0) {
            return;
        }


        // =========================
        // KIỂM TRA SỐ LƯỢNG
        // =========================

        if (
            quantity < 1 ||
            quantity > product.quantity
        ) {
            return;
        }


        // =========================
        // THÊM VÀO GIỎ
        // =========================

        addToCart(
            product,
            quantity
        );


        console.log(
            "✅ Đã thêm vào giỏ:",
            product.name,
            "x",
            quantity
        );


        // =========================
        // HIỆN THÔNG BÁO
        // =========================

        setShowSuccess(true);


        // Tự động ẩn sau 2.5 giây

        setTimeout(() => {

            setShowSuccess(false);

        }, 2500);

    };


    /* =========================
       BUY NOW
    ========================= */

    const handleBuyNow = () => {

        if (!isLoggedIn) {

            navigate("/login", {
                state: {
                    from: `/products/${product.id}`
                }
            });

            return;

        }


        if (
            quantity < 1 ||
            quantity > product.quantity
        ) {
            return;
        }


        addToCart(
            product,
            quantity
        );

        navigate("/cart");

    };


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="product-detail-page">


            {/* =========================
                SUCCESS TOAST
            ========================= */}

            {showSuccess && (

                <div className="cart-success-toast">

                    <span className="success-icon">
                        ✓
                    </span>

                    <div>

                        <strong>
                            Thêm sản phẩm thành công
                        </strong>

                        <p>
                            Đã thêm {quantity} sản phẩm vào giỏ hàng.
                        </p>

                    </div>

                </div>

            )}


            {/* =========================
                BREADCRUMB
            ========================= */}

            <div className="breadcrumb">

                <Link to="/">
                    Trang chủ
                </Link>

                <span>/</span>

                <Link to="/products">
                    Sản phẩm
                </Link>

                <span>/</span>

                <strong>
                    {product.name}
                </strong>

            </div>


            {/* =========================
                DETAIL
            ========================= */}

            <section className="product-detail">


                {/* =========================
                    IMAGE
                ========================= */}

                <div className="detail-image">

                    {product.imageUrl ? (

                        <img
                            src={product.imageUrl}
                            alt={product.name}
                        />

                    ) : (

                        <ShoppingCart
                            size={100}
                        />

                    )}

                </div>


                {/* =========================
                    INFORMATION
                ========================= */}

                <div className="detail-info">

                    <span className="detail-category">

                        {product.category?.name}

                    </span>


                    <h1>
                        {product.name}
                    </h1>


                    <div className="detail-rating">

                        ⭐ 4.8

                        <span>
                            128 đánh giá
                        </span>

                    </div>


                    <div className="detail-price">

                        {formatPrice(
                            product.price
                        )}

                    </div>


                    <p className="detail-description">

                        {product.description}

                    </p>


                    {/* =========================
                        STOCK
                    ========================= */}

                    <div className="product-stock">

                        {product.quantity > 0 ? (

                            <span className="in-stock">

                                ✓ Còn hàng
                                {" "}
                                ({product.quantity})

                            </span>

                        ) : (

                            <span className="out-stock">

                                Hết hàng

                            </span>

                        )}

                    </div>


                    {/* =========================
                        QUANTITY
                    ========================= */}

                    <div className="quantity-section">

                        <span>
                            Số lượng
                        </span>


                        <div className="quantity-control">


                            {/* GIẢM */}

                            <button
                                type="button"

                                onClick={
                                    handleDecrease
                                }

                                disabled={
                                    product.quantity <= 0 ||
                                    quantity <= 1
                                }

                                title="Giảm số lượng"
                            >

                                <Minus size={17} />

                            </button>


                            {/* INPUT SỐ LƯỢNG */}

                            <input
                                type="text"
                                inputMode="numeric"

                                value={
                                    editingQuantity !== null
                                        ? editingQuantity
                                        : quantity
                                }

                                min="1"
                                max={product.quantity}
                                maxLength={6}

                                onFocus={
                                    handleQuantityFocus
                                }

                                onChange={(e) =>
                                    handleQuantityChange(
                                        e.target.value
                                    )
                                }

                                onBlur={(e) =>
                                    handleQuantityBlur(
                                        e.target.value
                                    )
                                }

                                onKeyDown={(e) => {

                                    /*
                                     * Chỉ cho phép:
                                     *
                                     * 0 → 9
                                     * Backspace
                                     * Delete
                                     * Arrow
                                     * Tab
                                     * Enter
                                     */

                                    const allowedKeys = [
                                        "Backspace",
                                        "Delete",
                                        "ArrowLeft",
                                        "ArrowRight",
                                        "ArrowUp",
                                        "ArrowDown",
                                        "Tab",
                                        "Enter"
                                    ];


                                    if (
                                        !/[0-9]/.test(e.key) &&
                                        !allowedKeys.includes(
                                            e.key
                                        ) &&
                                        !e.ctrlKey &&
                                        !e.metaKey
                                    ) {

                                        e.preventDefault();

                                    }


                                    /*
                                     * Enter → kết thúc nhập.
                                     */

                                    if (
                                        e.key === "Enter"
                                    ) {

                                        e.currentTarget.blur();

                                    }

                                }}

                                aria-label="Số lượng sản phẩm"

                            />


                            {/* TĂNG */}

                            <button
                                type="button"

                                onClick={
                                    handleIncrease
                                }

                                disabled={
                                    product.quantity <= 0 ||
                                    quantity >= product.quantity
                                }

                                title={
                                    product.quantity <= 0
                                        ? "Sản phẩm hết hàng"
                                        : quantity >= product.quantity
                                            ? "Đã đạt số lượng tồn kho"
                                            : "Tăng số lượng"
                                }
                            >

                                <Plus size={17} />

                            </button>

                        </div>

                    </div>


                    {/* =========================
                        ADD CART
                    ========================= */}

                    <button
                        type="button"
                        className="add-cart-button"

                        disabled={
                            product.quantity <= 0
                        }

                        onClick={
                            handleAddToCart
                        }
                    >

                        <ShoppingCart size={20} />

                        {product.quantity > 0
                            ? "Thêm vào giỏ hàng"
                            : "Hết hàng"
                        }

                    </button>


                    {/* =========================
                        BUY NOW
                    ========================= */}

                    <button
                        type="button"
                        className="buy-now-button"

                        disabled={
                            product.quantity <= 0
                        }

                        onClick={
                            handleBuyNow
                        }
                    >

                        Mua ngay

                    </button>

                </div>

            </section>


            {/* =========================
                DESCRIPTION
            ========================= */}

            <section className="product-description">

                <h2>
                    Mô tả sản phẩm
                </h2>


                <p>
                    {product.description}
                </p>


                <p>
                    Sản phẩm được cung cấp bởi
                    Smart Sales.
                    Thông tin chi tiết và giá bán
                    được lấy từ hệ thống.
                </p>

            </section>

        </div>

    );

}


export default ProductDetail;