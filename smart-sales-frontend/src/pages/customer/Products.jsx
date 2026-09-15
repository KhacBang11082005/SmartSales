import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productApi";

import "./Products.css";


function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

// =========================================================
// XỬ LÝ URL ẢNH SẢN PHẨM
// =========================================================

function getImageUrl(imageUrl) {

    if (!imageUrl) {
        return "";
    }

    // Nếu đã là link đầy đủ
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Ảnh được lưu trong Backend
    return `http://localhost:8080${imageUrl}`;
}
function Products() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Lấy category trên URL
    const [searchParams] = useSearchParams();

    const categoryName = searchParams.get("category");


    /* =====================================================
       LẤY DANH SÁCH SẢN PHẨM
    ===================================================== */

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);

                setError("");

                const data = await getProducts();

                console.log("📦 PRODUCTS FROM API:", data);

                setProducts(Array.isArray(data) ? data : []);

            } catch (error) {

                console.error(
                    "❌ Không thể lấy sản phẩm:",
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


    /* =====================================================
       MỖI KHI ĐỔI DANH MỤC → CUỘN LÊN ĐẦU TRANG
    ===================================================== */

    useEffect(() => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, [categoryName]);


    /* =====================================================
       LỌC + SẮP XẾP SẢN PHẨM
    ===================================================== */

    const displayedProducts = useMemo(() => {

        let result = [...products];


        // =================================================
        // NẾU CÓ CATEGORY
        // CHỈ HIỂN THỊ SẢN PHẨM THUỘC CATEGORY ĐÓ
        // =================================================

        if (categoryName) {

            result = result.filter(product => {

                const productCategory =
                    product.category?.name || "";

                return (
                    productCategory.trim().toLowerCase()
                    === categoryName.trim().toLowerCase()
                );

            });

        }


        // =================================================
        // SẮP XẾP THEO DANH MỤC
        // =================================================
        //
        // Ví dụ:
        //
        // Laptop
        //   - ASUS
        //   - Dell
        //
        // Điện thoại
        //   - iPhone
        //   - Samsung
        //
        // Phụ kiện
        //   - ...
        //
        // =================================================

        result.sort((a, b) => {

            const categoryA =
                a.category?.id ?? 999999;

            const categoryB =
                b.category?.id ?? 999999;


            // Ưu tiên category ID
            if (categoryA !== categoryB) {

                return categoryA - categoryB;

            }


            // Nếu cùng danh mục
            // sắp xếp tên sản phẩm A → Z

            return (a.name || "").localeCompare(
                b.name || "",
                "vi"
            );

        });


        return result;

    }, [products, categoryName]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <div className="products-loading">

                Đang tải sản phẩm...

            </div>
        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (
            <div className="products-error">

                {error}

            </div>
        );

    }


    /* =====================================================
       GIAO DIỆN
    ===================================================== */

    return (

        <div className="products-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="products-header">

                <div>

                    <span
                        style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#1769ff",
                            marginBottom: "8px",
                            textTransform: "uppercase"
                        }}
                    >

                    </span>


                    <h1>

                        {categoryName
                            ? categoryName
                            : "Tất cả sản phẩm"
                        }

                    </h1>


                    <p>

                        {categoryName
                            ? `Các sản phẩm thuộc danh mục ${categoryName}`
                            : "Khám phá các sản phẩm tại Smart Sales"
                        }

                    </p>

                </div>


                {/* SỐ LƯỢNG SẢN PHẨM */}

                <div
                    style={{
                        fontSize: "14px",
                        color: "#64748b"
                    }}
                >

                    {displayedProducts.length} sản phẩm

                </div>

            </div>


            {/* =================================================
                KHÔNG CÓ SẢN PHẨM
            ================================================= */}

            {displayedProducts.length === 0 ? (

                <div
                    style={{
                        textAlign: "center",
                        padding: "80px 20px",
                        color: "#64748b"
                    }}
                >

                    <h2>
                        Không có sản phẩm
                    </h2>

                    <p>
                        Hiện chưa có sản phẩm nào
                        trong danh mục này.
                    </p>


                    <Link
                        to="/products"
                        style={{
                            display: "inline-block",
                            marginTop: "20px",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            background: "#1769ff",
                            color: "#fff",
                            textDecoration: "none"
                        }}
                    >

                        Xem tất cả sản phẩm

                    </Link>

                </div>

            ) : (

                /* =================================================
                   PRODUCT GRID
                ================================================= */

                <div className="products-grid">

                    {displayedProducts.map(product => (

                        <Link
                            to={`/products/${product.id}`}
                            className="product-card"
                            key={product.id}
                        >

                            {/* IMAGE */}

                            <div className="product-image">

                                {product.imageUrl ? (

                                    <img
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.name}
                                    />

                                ) : (

                                    <span>
                                        🛒
                                    </span>

                                )}

                            </div>


                            {/* INFO */}

                            <div className="product-info">


                                {/* CATEGORY */}

                                <span className="product-category">

                                    {product.category?.name ||
                                        "Chưa phân loại"
                                    }

                                </span>


                                {/* NAME */}

                                <h3>
                                    {product.name}
                                </h3>


                                {/* DESCRIPTION */}

                                <p>
                                    {product.description}
                                </p>


                                {/* PRICE */}

                                <div className="product-bottom">

                                    <strong>
                                        {formatPrice(product.price)}
                                    </strong>

                                </div>

                            </div>

                        </Link>

                    ))}

                </div>

            )}

        </div>

    );

}


export default Products;