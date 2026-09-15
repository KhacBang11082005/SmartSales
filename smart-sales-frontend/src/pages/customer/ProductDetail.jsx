import {
    useEffect,
    useRef,
    useState
} from "react";

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
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { useCart } from "../../context/CartContext";

import {
    getProductById,
    getProductImages
} from "../../services/productApi";

import "./ProductDetail.css";


// =========================================================
// FORMAT GIÁ
// =========================================================

function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(price) + " ₫";
}


// =========================================================
// XỬ LÝ URL ẢNH
// =========================================================

function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }


    // Nếu đã là URL đầy đủ
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }


    // Nếu là ảnh upload từ Backend
    return `http://localhost:8080${imageUrl}`;
}


// =========================================================
// PRODUCT DETAIL
// =========================================================

function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { addToCart } = useCart();

    const { isLoggedIn } = useAuth();


    // =====================================================
    // STATE SẢN PHẨM
    // =====================================================

    const [product, setProduct] =
        useState(null);


    // =====================================================
    // STATE ẢNH
    // =====================================================

    const [productImages, setProductImages] =
        useState([]);


    // Ảnh đang chọn
    const [selectedImageIndex, setSelectedImageIndex] =
        useState(0);


    // =====================================================
    // STATE CHUNG
    // =====================================================

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const [showSuccess, setShowSuccess] =
        useState(false);


    // =====================================================
    // STATE SỐ LƯỢNG
    // =====================================================

    const [quantity, setQuantity] =
        useState(1);

    const [editingQuantity, setEditingQuantity] =
        useState(null);

    const [originalQuantity, setOriginalQuantity] =
        useState(1);


    // =====================================================
    // SWIPE
    // =====================================================

    const touchStartX =
        useRef(null);


    // =========================================================
    // LẤY SẢN PHẨM + ẢNH
    // =========================================================

    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);

                setError("");


                // =================================================
                // Lấy thông tin sản phẩm
                // =================================================

                const productData =
                    await getProductById(id);


                console.log(
                    "📦 PRODUCT:",
                    productData
                );


                if (!productData) {

                    setError(
                        "Không tìm thấy sản phẩm."
                    );

                    return;
                }


                setProduct(productData);


                // =================================================
                // Lấy danh sách ảnh riêng
                // =================================================

                try {

                    const images =
                        await getProductImages(id);


                    console.log(
                        "🖼️ PRODUCT IMAGES:",
                        images
                    );


                    if (
                        Array.isArray(images) &&
                        images.length > 0
                    ) {

                        setProductImages(images);

                    } else {

                        // =========================================
                        // Sản phẩm cũ chỉ có imageUrl
                        // =========================================

                        if (productData.imageUrl) {

                            setProductImages([
                                {
                                    imageUrl:
                                    productData.imageUrl
                                }
                            ]);

                        } else {

                            setProductImages([]);

                        }
                    }

                } catch (imageError) {

                    console.warn(
                        "⚠️ Không lấy được danh sách ảnh:",
                        imageError
                    );


                    // =============================================
                    // Nếu API nhiều ảnh lỗi
                    // vẫn hiển thị ảnh cũ.
                    // =============================================

                    if (productData.imageUrl) {

                        setProductImages([
                            {
                                imageUrl:
                                productData.imageUrl
                            }
                        ]);

                    } else {

                        setProductImages([]);

                    }
                }


                // =================================================
                // RESET
                // =================================================

                setSelectedImageIndex(0);

                setQuantity(1);

                setEditingQuantity(null);

                setOriginalQuantity(1);


            } catch (productError) {

                console.error(
                    "❌ Không thể lấy sản phẩm:",
                    productError
                );


                setError(
                    "Không thể tải thông tin sản phẩm."
                );

            } finally {

                setLoading(false);

            }
        };


        fetchData();

    }, [id]);


    // =========================================================
    // ẢNH TRƯỚC
    // =========================================================

    const handlePreviousImage = () => {

        if (productImages.length <= 1) {
            return;
        }


        setSelectedImageIndex((prev) => {

            if (prev === 0) {

                return productImages.length - 1;

            }

            return prev - 1;
        });
    };


    // =========================================================
    // ẢNH SAU
    // =========================================================

    const handleNextImage = () => {

        if (productImages.length <= 1) {
            return;
        }


        setSelectedImageIndex((prev) => {

            if (
                prev ===
                productImages.length - 1
            ) {

                return 0;

            }

            return prev + 1;
        });
    };


    // =========================================================
    // BẮT ĐẦU SWIPE
    // =========================================================

    const handleTouchStart = (event) => {

        touchStartX.current =
            event.touches[0].clientX;
    };


    // =========================================================
    // KẾT THÚC SWIPE
    // =========================================================

    const handleTouchEnd = (event) => {

        if (
            touchStartX.current === null
        ) {
            return;
        }


        const touchEndX =
            event.changedTouches[0].clientX;


        const difference =
            touchStartX.current -
            touchEndX;


        // Vuốt sang trái
        if (difference > 50) {

            handleNextImage();

        }


        // Vuốt sang phải
        if (difference < -50) {

            handlePreviousImage();

        }


        touchStartX.current = null;
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="product-loading">
                Đang tải sản phẩm...
            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

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


    // =========================================================
    // BẮT ĐẦU CHỈNH SỐ LƯỢNG
    // =========================================================

    const handleQuantityFocus = () => {

        setOriginalQuantity(quantity);

        setEditingQuantity(
            String(quantity)
        );
    };


    // =========================================================
    // THAY ĐỔI SỐ LƯỢNG
    // =========================================================

    const handleQuantityChange = (value) => {

        if (!/^\d*$/.test(value)) {
            return;
        }


        setEditingQuantity(value);


        // Cho phép ô tạm thời rỗng
        if (value === "") {
            return;
        }


        let newQuantity =
            Number(value);


        // Không cho nhập 0
        if (newQuantity === 0) {
            return;
        }


        // Không vượt tồn kho
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


        setQuantity(newQuantity);
    };


    // =========================================================
    // RỜI INPUT
    // =========================================================

    const handleQuantityBlur = (value) => {

        if (value === "") {

            setQuantity(
                originalQuantity
            );

            setEditingQuantity(null);

            return;
        }


        let newQuantity =
            Number(value);


        if (
            !Number.isInteger(newQuantity) ||
            newQuantity < 1
        ) {

            newQuantity =
                originalQuantity;
        }


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


    // =========================================================
    // GIẢM
    // =========================================================

    const handleDecrease = () => {

        setEditingQuantity(null);

        setQuantity((prev) =>
            Math.max(1, prev - 1)
        );
    };


    // =========================================================
    // TĂNG
    // =========================================================

    const handleIncrease = () => {

        setEditingQuantity(null);

        setQuantity((prev) =>
            Math.min(
                Number(product.quantity || 0),
                prev + 1
            )
        );
    };


    // =========================================================
    // THÊM VÀO GIỎ
    // =========================================================

    const handleAddToCart = () => {

        // Chưa đăng nhập
        if (!isLoggedIn) {

            navigate("/login", {
                state: {
                    from:
                        `/products/${product.id}`
                }
            });

            return;
        }


        // Hết hàng
        if (product.quantity <= 0) {
            return;
        }


        // Kiểm tra số lượng
        if (
            quantity < 1 ||
            quantity > product.quantity
        ) {
            return;
        }


        // Thêm vào giỏ
        addToCart(
            product,
            quantity
        );


        // Hiện thông báo
        setShowSuccess(true);


        setTimeout(() => {

            setShowSuccess(false);

        }, 2500);
    };


    // =========================================================
    // MUA NGAY
    // =========================================================

    const handleBuyNow = () => {

        if (!isLoggedIn) {

            navigate("/login", {
                state: {
                    from:
                        `/products/${product.id}`
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


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="product-detail-page">


            {/* =================================================
                THÔNG BÁO THÊM GIỎ
            ================================================= */}

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
                            Đã thêm {quantity} sản phẩm
                            vào giỏ hàng.
                        </p>

                    </div>

                </div>
            )}


            {/* =================================================
                BREADCRUMB
            ================================================= */}

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


            {/* =================================================
                CHI TIẾT SẢN PHẨM
            ================================================= */}

            <section className="product-detail">


                {/* =================================================
                    GALLERY
                ================================================= */}

                <div className="product-gallery">


                    {/* =================================================
                        ẢNH LỚN
                    ================================================= */}

                    <div
                        className="gallery-main"

                        onTouchStart={
                            handleTouchStart
                        }

                        onTouchEnd={
                            handleTouchEnd
                        }
                    >

                        {productImages.length > 0 ? (

                            <>

                                <img
                                    src={getImageUrl(
                                        productImages[
                                            selectedImageIndex
                                            ]?.imageUrl
                                    )}

                                    alt={product.name}

                                    className="gallery-main-image"
                                />


                                {/* =================================
                                    NÚT TRÁI
                                ================================= */}

                                {productImages.length > 1 && (

                                    <button
                                        type="button"

                                        className={
                                            "gallery-arrow " +
                                            "gallery-arrow-left"
                                        }

                                        onClick={
                                            handlePreviousImage
                                        }

                                        aria-label="Ảnh trước"
                                    >

                                        <ChevronLeft
                                            size={24}
                                        />

                                    </button>
                                )}


                                {/* =================================
                                    NÚT PHẢI
                                ================================= */}

                                {productImages.length > 1 && (

                                    <button
                                        type="button"

                                        className={
                                            "gallery-arrow " +
                                            "gallery-arrow-right"
                                        }

                                        onClick={
                                            handleNextImage
                                        }

                                        aria-label="Ảnh sau"
                                    >

                                        <ChevronRight
                                            size={24}
                                        />

                                    </button>
                                )}

                            </>

                        ) : (

                            <ShoppingCart
                                size={100}
                            />

                        )}

                    </div>


                    {/* =================================================
                        THUMBNAIL
                    ================================================= */}

                    {productImages.length > 1 && (

                        <div className="gallery-thumbnails">

                            {productImages.map(
                                (image, index) => (

                                    <button
                                        type="button"

                                        key={
                                            image.id ||
                                            `${image.imageUrl}-${index}`
                                        }

                                        className={
                                            `gallery-thumbnail ` +
                                            (
                                                selectedImageIndex === index
                                                    ? "active"
                                                    : ""
                                            )
                                        }

                                        onClick={() =>
                                            setSelectedImageIndex(
                                                index
                                            )
                                        }
                                    >

                                        <img
                                            src={getImageUrl(
                                                image.imageUrl
                                            )}

                                            alt={
                                                `Ảnh ${index + 1}`
                                            }
                                        />

                                    </button>
                                )
                            )}

                        </div>
                    )}

                </div>


                {/* =================================================
                    THÔNG TIN
                ================================================= */}

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


                    {/* =================================================
                        TỒN KHO
                    ================================================= */}

                    <div className="product-stock">

                        {product.quantity > 0 ? (

                            <span className="in-stock">

                                ✓ Còn hàng ({product.quantity})

                            </span>

                        ) : (

                            <span className="out-stock">

                                Hết hàng

                            </span>
                        )}

                    </div>


                    {/* =================================================
                        SỐ LƯỢNG
                    ================================================= */}

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
                            >

                                <Minus size={17} />

                            </button>


                            {/* INPUT */}

                            <input
                                type="text"

                                inputMode="numeric"

                                value={
                                    editingQuantity !== null
                                        ? editingQuantity
                                        : quantity
                                }

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
                            >

                                <Plus size={17} />

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        THÊM GIỎ
                    ================================================= */}

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


                    {/* =================================================
                        MUA NGAY
                    ================================================= */}

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


            {/* =================================================
                MÔ TẢ
            ================================================= */}

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