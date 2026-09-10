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


function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(price) + " ₫";

}


function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { addToCart } = useCart();

    const [showSuccess, setShowSuccess] = useState(false);

    const {
        isLoggedIn
    } = useAuth();


    const [product, setProduct] = useState(null);

    const [quantity, setQuantity] = useState(1);

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


        addToCart(
            product,
            quantity
        );

        navigate("/cart");

    };


    return (

        <div className="product-detail-page">
            {/* SUCCESS TOAST */}
            {/* SUCCESS TOAST */}

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


                {/* IMAGE */}

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


                {/* INFORMATION */}

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


                    {/* STOCK */}

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


                    {/* QUANTITY */}

                    <div className="quantity-section">

                        <span>
                            Số lượng
                        </span>


                        <div className="quantity-control">

                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity(prev =>
                                        Math.max(
                                            1,
                                            prev - 1
                                        )
                                    )
                                }
                            >

                                <Minus size={17} />

                            </button>


                            <span>
                                {quantity}
                            </span>


                            <button
                                type="button"
                                disabled={
                                    product.quantity <= quantity
                                }
                                onClick={() =>
                                    setQuantity(prev =>
                                        Math.min(
                                            product.quantity,
                                            prev + 1
                                        )
                                    )
                                }
                            >

                                <Plus size={17} />

                            </button>

                        </div>

                    </div>


                    {/* ADD CART */}

                    <button
                        type="button"
                        className="add-cart-button"
                        disabled={product.quantity <= 0}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={20} />

                        {product.quantity > 0
                            ? "Thêm vào giỏ hàng"
                            : "Hết hàng"
                        }
                    </button>


                    {/* BUY NOW */}

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


            {/* DESCRIPTION */}

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