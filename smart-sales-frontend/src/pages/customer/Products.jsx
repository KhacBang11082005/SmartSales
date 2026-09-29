
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productApi";
import { getTopSellingProducts } from "../../services/statisticsApi";

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

    // =====================================================
    // DANH SÁCH SẢN PHẨM BÁN CHẠY
    // =====================================================

    const [topSellingProducts, setTopSellingProducts] =
        useState([]);


    // =====================================================
    // LẤY THAM SỐ TRÊN URL
    // =====================================================

    const [searchParams] = useSearchParams();

    // Ví dụ:
    // /products?category=Điện thoại
    const categoryName = searchParams.get("category");

    // Ví dụ:
    // /products?sort=top-selling
    const sortType = searchParams.get("sort");


    /* =====================================================
       LẤY DANH SÁCH SẢN PHẨM
    ===================================================== */

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);

                setError("");


                /* =========================================
                   LẤY TẤT CẢ SẢN PHẨM
                ========================================= */

                const data = await getProducts();

                console.log(
                    "📦 PRODUCTS FROM API:",
                    data
                );


                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                );


                /* =========================================
                   NẾU ĐANG XEM SẢN PHẨM BÁN CHẠY
                ========================================= */

                if (sortType === "top-selling") {

                    try {

                        const topSellingData =
                            await getTopSellingProducts();

                        console.log(
                            "🏆 TOP SELLING PRODUCTS:",
                            topSellingData
                        );


                        setTopSellingProducts(
                            Array.isArray(topSellingData)
                                ? topSellingData
                                : []
                        );

                    } catch (topSellingError) {

                        console.error(
                            "❌ Không thể lấy sản phẩm bán chạy:",
                            topSellingError
                        );


                        /*
                         * Không fallback về toàn bộ sản phẩm.
                         *
                         * Nếu API bán chạy lỗi thì
                         * danh sách bán chạy phải rỗng.
                         */

                        setTopSellingProducts([]);

                    }

                } else {

                    /*
                     * Nếu không phải trang bán chạy
                     * thì xóa dữ liệu bán chạy.
                     */

                    setTopSellingProducts([]);

                }


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

    }, [sortType]);


    /* =====================================================
       MỖI KHI ĐỔI DANH MỤC / KIỂU HIỂN THỊ
       → CUỘN LÊN ĐẦU TRANG
    ===================================================== */

    useEffect(() => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, [categoryName, sortType]);


    /* =====================================================
       LỌC + SẮP XẾP SẢN PHẨM
    ===================================================== */

    const displayedProducts = useMemo(() => {

        let result = [];


        /* =================================================
           SẢN PHẨM BÁN CHẠY
        ================================================= */

        if (sortType === "top-selling") {

            /*
             * API thống kê trả về:
             *
             * {
             *     productId,
             *     productName,
             *     totalQuantitySold,
             *     totalRevenue
             * }
             *
             * Tìm sản phẩm tương ứng
             * trong danh sách products.
             */

            result = topSellingProducts
                .map((item) => {

                    const product = products.find(
                        (p) =>
                            Number(p.id) ===
                            Number(item.productId)
                    );


                    if (!product) {
                        return null;
                    }


                    return {
                        ...product,

                        /*
                         * Lưu lại số lượng đã bán.
                         * Có thể sử dụng sau này nếu muốn
                         * hiển thị "Đã bán X sản phẩm".
                         */

                        totalQuantitySold:
                            item.totalQuantitySold ?? 0
                    };

                })
                .filter(Boolean);


        } else {

            /*
             * Nếu không phải trang bán chạy
             * thì giữ nguyên toàn bộ sản phẩm.
             */

            result = [...products];

        }


        /* =================================================
           LỌC THEO CATEGORY
        ================================================= */

        if (categoryName) {

            result = result.filter(product => {

                const productCategory =
                    product.category?.name || "";


                return (
                    productCategory
                        .trim()
                        .toLowerCase()
                    ===
                    categoryName
                        .trim()
                        .toLowerCase()
                );

            });

        }


        /* =================================================
           NẾU LÀ SẢN PHẨM BÁN CHẠY
        ================================================= */

        if (sortType === "top-selling") {

            /*
             * Không sort lại.
             *
             * Backend đã sắp xếp:
             *
             * ORDER BY SUM(od.quantity) DESC
             *
             * nên sản phẩm bán nhiều nhất
             * sẽ đứng đầu danh sách.
             */

            return result;

        }


        /* =================================================
           SẢN PHẨM THÔNG THƯỜNG
           SẮP XẾP THEO CATEGORY
        ================================================= */

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

    }, [
        products,
        categoryName,
        sortType,
        topSellingProducts
    ]);


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


                    {/* =================================================
                        TIÊU ĐỀ
                    ================================================= */}

                    <h1>

                        {sortType === "top-selling"
                            ? "Sản phẩm bán chạy nhất"
                            : categoryName
                                ? categoryName
                                : "Tất cả sản phẩm"
                        }

                    </h1>


                    {/* =================================================
                        MÔ TẢ
                    ================================================= */}

                    <p>

                        {sortType === "top-selling"
                            ? "Các sản phẩm được mua nhiều nhất tại Smart Sales"
                            : categoryName
                                ? `Các sản phẩm thuộc danh mục ${categoryName}`
                                : "Khám phá các sản phẩm tại Smart Sales"
                        }

                    </p>

                </div>


                {/* =================================================
                    SỐ LƯỢNG SẢN PHẨM
                ================================================= */}

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

                        {sortType === "top-selling"
                            ? "Chưa có sản phẩm bán chạy"
                            : "Không có sản phẩm"
                        }

                    </h2>


                    <p>

                        {sortType === "top-selling"
                            ? "Hiện chưa có sản phẩm nào có đơn hàng hoàn tất."
                            : categoryName
                                ? "Hiện chưa có sản phẩm nào trong danh mục này."
                                : "Hiện chưa có sản phẩm nào."
                        }

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

                            {/* =================================================
                                IMAGE
                            ================================================= */}

                            <div className="product-image">

                                {product.imageUrl ? (

                                    <img
                                        src={getImageUrl(
                                            product.imageUrl
                                        )}
                                        alt={product.name}
                                    />

                                ) : (

                                    <span>
                                        🛒
                                    </span>

                                )}

                            </div>


                            {/* =================================================
                                INFO
                            ================================================= */}

                            <div className="product-info">


                                {/* =================================================
                                    CATEGORY
                                ================================================= */}

                                <span className="product-category">

                                    {product.category?.name ||
                                        "Chưa phân loại"
                                    }

                                </span>


                                {/* =================================================
                                    NAME
                                ================================================= */}

                                <h3>

                                    {product.name}

                                </h3>


                                {/* =================================================
                                    DESCRIPTION
                                ================================================= */}

                                <p>

                                    {product.description}

                                </p>


                                {/* =================================================
                                    PRICE
                                ================================================= */}

                                <div className="product-bottom">

                                    <strong>

                                        {formatPrice(
                                            product.price
                                        )}

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

