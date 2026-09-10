import {
    CheckCircle2,
    Clock3,
    LoaderCircle,
    PackageCheck,
    ShoppingCart,
    TrendingUp,
    XCircle
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";

import "./AdminDashboard.css";


/* =========================================================
   FORMAT
========================================================= */

function formatPrice(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "0 ₫";
    }

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(value) + " ₫";

}


function formatNumber(value) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(value || 0);

}


/* =========================================================
   DASHBOARD
========================================================= */

function AdminDashboard() {

    const [statistics, setStatistics] =
        useState(null);

    const [topProducts, setTopProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {

        const loadDashboard =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const [
                        dashboardResponse,
                        topProductsResponse
                    ] = await Promise.all([

                        api.get(
                            "/statistics/dashboard"
                        ),

                        api.get(
                            "/statistics/top-products"
                        )

                    ]);


                    console.log(
                        "📊 DASHBOARD:",
                        dashboardResponse.data
                    );

                    console.log(
                        "🏆 TOP PRODUCTS:",
                        topProductsResponse.data
                    );


                    setStatistics(
                        dashboardResponse.data
                    );


                    setTopProducts(
                        Array.isArray(
                            topProductsResponse.data
                        )
                            ? topProductsResponse.data
                            : []
                    );


                } catch (error) {

                    console.error(
                        "❌ Dashboard error:",
                        error
                    );

                    setError(
                        "Không thể tải dữ liệu Dashboard."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadDashboard();

    }, []);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="admin-loading">

                <LoaderCircle
                    size={30}
                    className="admin-loading-icon"
                />

                <span>
                    Đang tải Dashboard...
                </span>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="admin-error">

                <XCircle size={24} />

                <div>

                    <strong>
                        Có lỗi xảy ra
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="admin-dashboard">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="admin-page-header">

                <div>

                    <span className="admin-page-label">
                        DASHBOARD
                    </span>

                    <h1>
                        Tổng quan hệ thống
                    </h1>

                    <p>
                        Theo dõi hoạt động kinh doanh
                        của Smart Sales.
                    </p>

                </div>

            </div>



            {/* =================================================
                OVERVIEW CARDS
            ================================================= */}

            <div className="admin-stat-grid">


                {/* DOANH THU */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon revenue">
                        <TrendingUp size={22} />
                    </div>

                    <div>

                        <span>
                            Tổng doanh thu
                        </span>

                        <strong>
                            {formatPrice(
                                statistics?.totalRevenue
                            )}
                        </strong>

                    </div>

                </div>



                {/* ĐƠN HÀNG */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon orders">
                        <ShoppingCart size={22} />
                    </div>

                    <div>

                        <span>
                            Tổng đơn hàng
                        </span>

                        <strong>
                            {formatNumber(
                                statistics?.totalOrders
                            )}
                        </strong>

                    </div>

                </div>



                {/* SẢN PHẨM ĐÃ BÁN */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon products">
                        <PackageCheck size={22} />
                    </div>

                    <div>

                        <span>
                            Sản phẩm đã bán
                        </span>

                        <strong>
                            {formatNumber(
                                statistics?.totalProductsSold
                            )}
                        </strong>

                    </div>

                </div>



                {/* ĐƠN CHỜ */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon pending">
                        <Clock3 size={22} />
                    </div>

                    <div>

                        <span>
                            Đơn hàng đang chờ
                        </span>

                        <strong>
                            {formatNumber(
                                statistics?.pendingOrders
                            )}
                        </strong>

                    </div>

                </div>

            </div>



            {/* =================================================
                ORDER STATUS
            ================================================= */}

            <section className="admin-dashboard-section">

                <div className="admin-section-title">

                    <div>

                        <span>
                            ĐƠN HÀNG
                        </span>

                        <h2>
                            Trạng thái đơn hàng
                        </h2>

                    </div>

                </div>


                <div className="admin-order-status-grid">


                    {/* PENDING */}

                    <div className="admin-order-status">

                        <div className="status-icon pending">
                            <Clock3 size={20} />
                        </div>

                        <div>

                            <span>
                                Đang chờ
                            </span>

                            <strong>
                                {formatNumber(
                                    statistics?.pendingOrders
                                )}
                            </strong>

                        </div>

                    </div>



                    {/* CONFIRMED */}

                    <div className="admin-order-status">

                        <div className="status-icon confirmed">
                            <CheckCircle2 size={20} />
                        </div>

                        <div>

                            <span>
                                Đã xác nhận
                            </span>

                            <strong>
                                {formatNumber(
                                    statistics?.confirmedOrders
                                )}
                            </strong>

                        </div>

                    </div>



                    {/* PROCESSING */}

                    <div className="admin-order-status">

                        <div className="status-icon processing">
                            <LoaderCircle size={20} />
                        </div>

                        <div>

                            <span>
                                Đang xử lý
                            </span>

                            <strong>
                                {formatNumber(
                                    statistics?.processingOrders
                                )}
                            </strong>

                        </div>

                    </div>



                    {/* COMPLETED */}

                    <div className="admin-order-status">

                        <div className="status-icon completed">
                            <CheckCircle2 size={20} />
                        </div>

                        <div>

                            <span>
                                Hoàn thành
                            </span>

                            <strong>
                                {formatNumber(
                                    statistics?.completedOrders
                                )}
                            </strong>

                        </div>

                    </div>



                    {/* CANCELLED */}

                    <div className="admin-order-status">

                        <div className="status-icon cancelled">
                            <XCircle size={20} />
                        </div>

                        <div>

                            <span>
                                Đã hủy
                            </span>

                            <strong>
                                {formatNumber(
                                    statistics?.cancelledOrders
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>



            {/* =================================================
                TOP PRODUCTS
            ================================================= */}

            <section className="admin-dashboard-section">

                <div className="admin-section-title">

                    <div>

                        <span>
                            BÁN CHẠY
                        </span>

                        <h2>
                            Top sản phẩm bán chạy
                        </h2>

                    </div>

                </div>


                <div className="admin-top-products">


                    {topProducts.length === 0 ? (

                        <div className="admin-empty">

                            Chưa có dữ liệu sản phẩm bán chạy.

                        </div>

                    ) : (

                        topProducts.map(
                            (product, index) => (

                                <div
                                    className="admin-top-product"
                                    key={
                                        product.productId
                                        || index
                                    }
                                >

                                    <div className="top-product-rank">

                                        {index + 1}

                                    </div>


                                    <div className="top-product-info">

                                        <strong>

                                            {product.productName}

                                        </strong>

                                        <span>

                                            Đã bán:{" "}

                                            {formatNumber(
                                                product.totalQuantitySold
                                            )}

                                        </span>

                                    </div>


                                    <div className="top-product-revenue">

                                        {formatPrice(
                                            product.totalRevenue
                                        )}

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            </section>

        </div>

    );

}


export default AdminDashboard;