import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import {
    ArrowRight,
    Headphones,
    Laptop,
    Smartphone,
    ShoppingBag,
    Tv,
    Camera,
    Tablet,
    Watch,
    Package
} from "lucide-react";

import "./Home.css";

import { getProducts } from "../../services/productApi";
import { getCategories } from "../../services/categoryApi";


/* =========================================================
   ICON DANH MỤC
========================================================= */

/*
 * Giữ icon cũ cho các danh mục hiện tại.
 * Các danh mục mới thêm từ Admin sẽ tự động được
 * chọn icon phù hợp theo tên.
 */

const getCategoryIcon = (name) => {

    if (!name) {
        return Package;
    }

    const categoryName = name.toLowerCase();

    /* Điện thoại */
    if (
        categoryName.includes("điện thoại") ||
        categoryName.includes("smartphone") ||
        categoryName.includes("phone")
    ) {
        return Smartphone;
    }

    /* Laptop */
    if (
        categoryName.includes("laptop") ||
        categoryName.includes("máy tính xách tay")
    ) {
        return Laptop;
    }

    /* Tai nghe */
    if (
        categoryName.includes("tai nghe") ||
        categoryName.includes("headphone") ||
        categoryName.includes("earphone") ||
        categoryName.includes("earbuds")
    ) {
        return Headphones;
    }

    /* Phụ kiện */
    if (
        categoryName.includes("phụ kiện") ||
        categoryName.includes("accessory")
    ) {
        return ShoppingBag;
    }

    /* Tivi */
    if (
        categoryName.includes("tivi") ||
        categoryName.includes("tv") ||
        categoryName.includes("tivi")
    ) {
        return Tv;
    }

    /* Camera */
    if (
        categoryName.includes("camera") ||
        categoryName.includes("máy ảnh")
    ) {
        return Camera;
    }

    /* Máy tính bảng */
    if (
        categoryName.includes("tablet") ||
        categoryName.includes("máy tính bảng")
    ) {
        return Tablet;
    }

    /* Đồng hồ */
    if (
        categoryName.includes("đồng hồ") ||
        categoryName.includes("smartwatch")
    ) {
        return Watch;
    }

    /* Không xác định */
    return Package;
};


/* =========================================================
   FORMAT GIÁ
========================================================= */

function formatPrice(price) {

    if (price === null || price === undefined) {
        return "Liên hệ";
    }

    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";

}


/* =========================================================
   HOME
========================================================= */

function Home() {

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================================
       ĐIỀU KHIỂN KÉO DANH MỤC
    ===================================================== */

    const categoryGridRef = useRef(null);

    const isDragging = useRef(false);

    const startX = useRef(0);

    const scrollLeft = useRef(0);

    const hasDragged = useRef(false);


    /* =====================================================
       LẤY TẤT CẢ SẢN PHẨM VÀ DANH MỤC
    ===================================================== */

    useEffect(() => {

        const fetchHomeData = async () => {

            try {

                setLoading(true);

                setError("");


                /* =========================
                   LẤY SẢN PHẨM
                ========================= */

                const productData = await getProducts();

                console.log(
                    "📦 Sản phẩm trang chủ:",
                    productData
                );


                if (Array.isArray(productData)) {

                    setProducts(productData);

                } else if (
                    Array.isArray(productData?.content)
                ) {

                    setProducts(productData.content);

                } else {

                    setProducts([]);

                }


                /* =========================
                   LẤY DANH MỤC
                ========================= */

                const categoryData = await getCategories();

                console.log(
                    "📂 Danh mục trang chủ:",
                    categoryData
                );


                /*
                 * API có thể trả về:
                 *
                 * [
                 *   {...},
                 *   {...}
                 * ]
                 *
                 * hoặc:
                 *
                 * {
                 *   content: [...]
                 * }
                 */

                if (Array.isArray(categoryData)) {

                    setCategories(categoryData);

                } else if (
                    Array.isArray(categoryData?.content)
                ) {

                    setCategories(categoryData.content);

                } else {

                    setCategories([]);

                }


            } catch (error) {

                console.error(
                    "❌ Không lấy được dữ liệu trang chủ:",
                    error
                );

                setError(
                    "Không thể tải dữ liệu trang chủ."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchHomeData();

    }, []);


    /* =====================================================
       BẮT ĐẦU KÉO DANH MỤC
    ===================================================== */

    const handleMouseDown = (e) => {

        if (!categoryGridRef.current) {
            return;
        }

        isDragging.current = true;

        hasDragged.current = false;

        startX.current =
            e.pageX -
            categoryGridRef.current.offsetLeft;

        scrollLeft.current =
            categoryGridRef.current.scrollLeft;

        categoryGridRef.current.classList.add("dragging");

    };


    /* =====================================================
       DI CHUYỂN DANH MỤC KHI KÉO
    ===================================================== */

    const handleMouseMove = (e) => {

        if (
            !isDragging.current ||
            !categoryGridRef.current
        ) {
            return;
        }

        e.preventDefault();

        const x =
            e.pageX -
            categoryGridRef.current.offsetLeft;

        const walk =
            x -
            startX.current;


        if (Math.abs(walk) > 5) {

            hasDragged.current = true;

        }


        categoryGridRef.current.scrollLeft =
            scrollLeft.current -
            walk;

    };


    /* =====================================================
       KẾT THÚC KÉO
    ===================================================== */

    const handleMouseUp = () => {

        isDragging.current = false;

        if (categoryGridRef.current) {

            categoryGridRef.current.classList.remove(
                "dragging"
            );

        }

    };


    /* =====================================================
       RỜI KHỎI VÙNG DANH MỤC
    ===================================================== */

    const handleMouseLeave = () => {

        isDragging.current = false;

        if (categoryGridRef.current) {

            categoryGridRef.current.classList.remove(
                "dragging"
            );

        }

    };


    /* =====================================================
       NGĂN CLICK KHI VỪA KÉO
    ===================================================== */

    const handleCategoryClick = (e) => {

        if (hasDragged.current) {

            e.preventDefault();

            e.stopPropagation();

            hasDragged.current = false;

        }

    };


    return (

        <div className="home">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="hero">

                <div className="hero-content">

                    <span className="hero-label">
                        SMART SHOPPING
                    </span>


                    <h1>

                        Mua sắm thông minh.
                        <br />

                        Lựa chọn dễ dàng.

                    </h1>


                    <p>

                        Khám phá những sản phẩm chất lượng
                        với trải nghiệm mua sắm hiện đại,
                        nhanh chóng và thuận tiện.

                    </p>


                    <Link
                        to="/products"
                        className="hero-button"
                    >

                        Mua sắm ngay

                        <ArrowRight size={20} />

                    </Link>

                </div>

            </section>



            {/* =================================================
                CATEGORY
            ================================================= */}

            <section className="category-section">

                <div className="section-header">

                    <div>

                        <span className="section-label">
                            DANH MỤC
                        </span>


                        <h2>
                            Khám phá danh mục
                        </h2>

                    </div>

                </div>


                {/* =================================================
                    CATEGORY SLIDER
                ================================================= */}

                <div
                    className="category-grid"
                    ref={categoryGridRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >

                    {categories.map((category) => {

                        /*
                         * Lấy tên danh mục.
                         *
                         * Hỗ trợ cả trường hợp API trả:
                         * category.name
                         * hoặc category.categoryName
                         */

                        const categoryName =
                            category.name ||
                            category.categoryName ||
                            "Danh mục";


                        /*
                         * Tự động chọn icon.
                         */

                        const Icon =
                            getCategoryIcon(categoryName);


                        return (

                            <Link
                                key={category.id}
                                to={`/products?category=${encodeURIComponent(
                                    categoryName
                                )}`}
                                className="category-card"
                                onClick={handleCategoryClick}
                            >

                                <div className="category-icon">

                                    <Icon size={30} />

                                </div>


                                <h3>

                                    {categoryName}

                                </h3>


                                <span>

                                    Khám phá ngay

                                </span>

                            </Link>

                        );

                    })}

                </div>

            </section>



            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section className="product-section">

                <div className="section-header">

                    <div>

                        <span className="section-label">
                            SẢN PHẨM
                        </span>


                        <h2>
                            Tất cả sản phẩm
                        </h2>

                    </div>


                    <Link to="/products">

                        Xem tất cả

                        <ArrowRight size={18} />

                    </Link>

                </div>



                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#64748b"
                        }}
                    >

                        Đang tải sản phẩm...

                    </div>

                )}



                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#dc2626"
                        }}
                    >

                        {error}

                    </div>

                )}



                {/* =================================================
                    KHÔNG CÓ SẢN PHẨM
                ================================================= */}

                {!loading &&
                    !error &&
                    products.length === 0 && (

                        <div
                            style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "#64748b"
                            }}
                        >

                            Chưa có sản phẩm nào.

                        </div>

                    )}



                {/* =================================================
                    PRODUCT GRID
                ================================================= */}

                {!loading &&
                    !error &&
                    products.length > 0 && (

                        <div className="product-grid">

                            {products.map((product) => (

                                <Link
                                    to={`/products/${product.id}`}
                                    className="product-card"
                                    key={product.id}
                                >


                                    {/* =========================
                                        IMAGE
                                    ========================= */}

                                    <div className="product-image">

                                        {product.imageUrl ? (

                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain"
                                                }}
                                            />

                                        ) : product.image_url ? (

                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain"
                                                }}
                                            />

                                        ) : (

                                            <ShoppingBag size={55} />

                                        )}

                                    </div>



                                    {/* =========================
                                        PRODUCT INFO
                                    ========================= */}

                                    <div
                                        className="product-info"
                                        style={{
                                            padding: "20px"
                                        }}
                                    >


                                        {/* CATEGORY */}

                                        <span className="product-category">

                                            {product.category?.name
                                                ||
                                                product.categoryName
                                                ||
                                                (
                                                    product.category_id
                                                        ? `Danh mục #${product.category_id}`
                                                        : "Sản phẩm"
                                                )
                                            }

                                        </span>



                                        {/* NAME */}

                                        <h3>

                                            {product.name}

                                        </h3>



                                        {/* DESCRIPTION */}

                                        <p className="product-description">

                                            {product.description
                                                ||
                                                "Sản phẩm chất lượng cao tại Smart Sales."
                                            }

                                        </p>



                                        {/* PRICE */}

                                        <div
                                            className="product-bottom"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginTop: "20px"
                                            }}
                                        >

                                            <strong>

                                                {formatPrice(
                                                    product.price
                                                )}

                                            </strong>


                                            <span
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "10px",
                                                    background:
                                                        "linear-gradient(135deg, #005BFF, #008AF5)",
                                                    color: "white"
                                                }}
                                            >

                                                <ShoppingBag size={18} />

                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    )}

            </section>

        </div>

    );

}


export default Home;