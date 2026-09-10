import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    ArrowRight,
    Headphones,
    Laptop,
    Smartphone,
    ShoppingBag
} from "lucide-react";

import "./Home.css";

import { getProducts } from "../../services/productApi";


/* =========================================================
   DANH MỤC
========================================================= */

const categories = [
    {
        id: 1,
        name: "Điện thoại",
        icon: Smartphone
    },
    {
        id: 2,
        name: "Laptop",
        icon: Laptop
    },
    {
        id: 3,
        name: "Tai nghe",
        icon: Headphones
    },
    {
        id: 4,
        name: "Phụ kiện",
        icon: ShoppingBag
    }
];


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

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================================
       LẤY TẤT CẢ SẢN PHẨM
    ===================================================== */

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);

                setError("");

                const data = await getProducts();

                console.log(
                    "📦 Sản phẩm trang chủ:",
                    data
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

                if (Array.isArray(data)) {

                    setProducts(data);

                } else if (Array.isArray(data?.content)) {

                    setProducts(data.content);

                } else {

                    setProducts([]);

                }


            } catch (error) {

                console.error(
                    "❌ Không lấy được sản phẩm:",
                    error
                );

                setError(
                    "Không thể tải danh sách sản phẩm."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProducts();

    }, []);


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



                <div className="category-grid">

                    {categories.map((category) => {

                        const Icon = category.icon;


                        return (

                            <Link
                                key={category.id}
                                to={`/products?category=${encodeURIComponent(
                                    category.name
                                )}`}
                                className="category-card"
                            >

                                <div className="category-icon">

                                    <Icon size={30} />

                                </div>


                                <h3>

                                    {category.name}

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
                                                || "Sản phẩm chất lượng cao tại Smart Sales."
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