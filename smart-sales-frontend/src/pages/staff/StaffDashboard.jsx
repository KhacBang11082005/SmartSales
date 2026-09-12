import { useEffect, useState } from "react";
import {
    ShoppingCart,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    TrendingUp,
    RefreshCw
} from "lucide-react";

import "./StaffDashboard.css";
import api from "../../services/api";


function StaffDashboard() {

    const [statistics, setStatistics] = useState(null);
    const [topProducts, setTopProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // FORMAT TIỀN
    // =====================================================

    const formatCurrency = (value) => {

        if (value === null || value === undefined) {
            return "0 ₫";
        }

        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }).format(Number(value));

    };


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");


            // =================================================
            // Gọi API Dashboard
            // api.js sẽ tự động thêm:
            // Authorization: Bearer <token>
            // =================================================

            const [
                dashboardResponse,
                topProductsResponse
            ] = await Promise.all([

                api.get("/statistics/dashboard"),

                api.get("/statistics/top-products")

            ]);


            // =================================================
            // Lấy dữ liệu Dashboard
            // =================================================

            const dashboardData =
                dashboardResponse.data;


            setStatistics(
                dashboardData
            );


            // =================================================
            // Lấy sản phẩm bán chạy
            // =================================================

            const topProductsData =
                topProductsResponse.data;


            setTopProducts(
                Array.isArray(topProductsData)
                    ? topProductsData
                    : []
            );


        } catch (err) {

            console.error(
                "Dashboard error:",
                err
            );


            // =============================================
            // Xử lý lỗi 401 / 403
            // =============================================

            if (err.response?.status === 401) {

                setError(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "Bạn không có quyền xem dữ liệu thống kê."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi tải Dashboard."
                );

            }


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD LẦN ĐẦU
    // =====================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="staff-dashboard-loading">

                <div className="staff-dashboard-spinner" />

                <p>
                    Đang tải dữ liệu Dashboard...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="staff-dashboard-error">

                <div className="staff-error-icon">

                    <XCircle size={28} />

                </div>

                <h3>
                    Không thể tải Dashboard
                </h3>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={loadDashboard}
                >

                    <RefreshCw size={16} />

                    Thử lại

                </button>

            </div>

        );

    }


    return (

        <div className="staff-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="staff-dashboard-heading">

                <div>

                    <h2>
                        Tổng quan bán hàng
                    </h2>

                    <p>
                        Theo dõi tình hình bán hàng và đơn hàng
                    </p>

                </div>


                <button
                    type="button"
                    className="staff-refresh-button"
                    onClick={loadDashboard}
                >

                    <RefreshCw size={16} />

                    Làm mới

                </button>

            </div>


            {/* =================================================
                STATISTICS CARDS
            ================================================= */}

            <div className="staff-stat-grid">


                {/* DOANH THU */}

                <div className="staff-stat-card revenue">

                    <div className="staff-stat-card-top">

                        <div className="staff-stat-icon">

                            <TrendingUp size={20} />

                        </div>

                    </div>


                    <div className="staff-stat-label">

                        Tổng doanh thu

                    </div>


                    <div className="staff-stat-value">

                        {formatCurrency(
                            statistics?.totalRevenue
                        )}

                    </div>

                </div>


                {/* TỔNG ĐƠN */}

                <div className="staff-stat-card orders">

                    <div className="staff-stat-card-top">

                        <div className="staff-stat-icon">

                            <ShoppingCart size={20} />

                        </div>

                    </div>


                    <div className="staff-stat-label">

                        Tổng đơn hàng

                    </div>


                    <div className="staff-stat-value">

                        {statistics?.totalOrders ?? 0}

                    </div>

                </div>


                {/* CHỜ XỬ LÝ */}

                <div className="staff-stat-card pending">

                    <div className="staff-stat-card-top">

                        <div className="staff-stat-icon">

                            <Clock size={20} />

                        </div>

                    </div>


                    <div className="staff-stat-label">

                        Chờ xử lý

                    </div>


                    <div className="staff-stat-value">

                        {statistics?.pendingOrders ?? 0}

                    </div>

                </div>


                {/* HOÀN THÀNH */}

                <div className="staff-stat-card completed">

                    <div className="staff-stat-card-top">

                        <div className="staff-stat-icon">

                            <CheckCircle size={20} />

                        </div>

                    </div>


                    <div className="staff-stat-label">

                        Đơn hoàn thành

                    </div>


                    <div className="staff-stat-value">

                        {statistics?.completedOrders ?? 0}

                    </div>

                </div>

            </div>


            {/* =================================================
                SECOND STATISTICS
            ================================================= */}

            <div className="staff-secondary-grid">


                {/* SẢN PHẨM ĐÃ BÁN */}

                <div className="staff-secondary-card">

                    <div className="staff-secondary-icon">

                        <Package size={18} />

                    </div>

                    <div>

                        <span>
                            Sản phẩm đã bán
                        </span>

                        <strong>
                            {statistics?.totalProductsSold ?? 0}
                        </strong>

                    </div>

                </div>


                {/* ĐÃ XÁC NHẬN */}

                <div className="staff-secondary-card">

                    <div className="staff-secondary-icon">

                        <CheckCircle size={18} />

                    </div>

                    <div>

                        <span>
                            Đã xác nhận
                        </span>

                        <strong>
                            {statistics?.confirmedOrders ?? 0}
                        </strong>

                    </div>

                </div>


                {/* ĐANG XỬ LÝ */}

                <div className="staff-secondary-card">

                    <div className="staff-secondary-icon">

                        <Package size={18} />

                    </div>

                    <div>

                        <span>
                            Đang xử lý
                        </span>

                        <strong>
                            {statistics?.processingOrders ?? 0}
                        </strong>

                    </div>

                </div>


                {/* ĐÃ HỦY */}

                <div className="staff-secondary-card">

                    <div className="staff-secondary-icon cancelled">

                        <XCircle size={18} />

                    </div>

                    <div>

                        <span>
                            Đã hủy
                        </span>

                        <strong>
                            {statistics?.cancelledOrders ?? 0}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN DASHBOARD
            ================================================= */}

            <div className="staff-dashboard-main-grid">


                {/* =================================================
                    ORDER STATUS
                ================================================= */}

                <div className="staff-dashboard-panel">

                    <div className="staff-panel-header">

                        <div>

                            <h3>
                                Tình trạng đơn hàng
                            </h3>

                            <p>
                                Tổng quan trạng thái hiện tại
                            </p>

                        </div>

                    </div>


                    <div className="staff-order-status-list">


                        {/* PENDING */}

                        <div className="staff-order-status-item">

                            <div className="staff-status-left">

                                <span className="status-dot pending-dot" />

                                <span>
                                    Chờ xử lý
                                </span>

                            </div>

                            <strong>
                                {statistics?.pendingOrders ?? 0}
                            </strong>

                        </div>


                        {/* CONFIRMED */}

                        <div className="staff-order-status-item">

                            <div className="staff-status-left">

                                <span className="status-dot confirmed-dot" />

                                <span>
                                    Đã xác nhận
                                </span>

                            </div>

                            <strong>
                                {statistics?.confirmedOrders ?? 0}
                            </strong>

                        </div>


                        {/* PROCESSING */}

                        <div className="staff-order-status-item">

                            <div className="staff-status-left">

                                <span className="status-dot processing-dot" />

                                <span>
                                    Đang xử lý
                                </span>

                            </div>

                            <strong>
                                {statistics?.processingOrders ?? 0}
                            </strong>

                        </div>


                        {/* COMPLETED */}

                        <div className="staff-order-status-item">

                            <div className="staff-status-left">

                                <span className="status-dot completed-dot" />

                                <span>
                                    Hoàn thành
                                </span>

                            </div>

                            <strong>
                                {statistics?.completedOrders ?? 0}
                            </strong>

                        </div>


                        {/* CANCELLED */}

                        <div className="staff-order-status-item">

                            <div className="staff-status-left">

                                <span className="status-dot cancelled-dot" />

                                <span>
                                    Đã hủy
                                </span>

                            </div>

                            <strong>
                                {statistics?.cancelledOrders ?? 0}
                            </strong>

                        </div>


                    </div>

                </div>


                {/* =================================================
                    TOP PRODUCTS
                ================================================= */}

                <div className="staff-dashboard-panel">

                    <div className="staff-panel-header">

                        <div>

                            <h3>
                                Sản phẩm bán chạy
                            </h3>

                            <p>
                                Top 5 sản phẩm có doanh số tốt nhất
                            </p>

                        </div>

                    </div>


                    <div className="staff-top-products">


                        {topProducts.length === 0 ? (

                            <div className="staff-empty">

                                Chưa có dữ liệu sản phẩm.

                            </div>

                        ) : (

                            topProducts.map(
                                (product, index) => (

                                    <div
                                        className="staff-top-product"
                                        key={
                                            product.productId ||
                                            product.id ||
                                            index
                                        }
                                    >

                                        {/* RANK */}

                                        <div className="staff-product-rank">

                                            {index + 1}

                                        </div>


                                        {/* PRODUCT INFO */}

                                        <div className="staff-product-info">

                                            <strong>

                                                {
                                                    product.productName ||
                                                    product.name ||
                                                    "Sản phẩm"
                                                }

                                            </strong>

                                            <span>

                                                Đã bán:{" "}

                                                {
                                                    product.totalQuantitySold ??
                                                    product.quantitySold ??
                                                    0
                                                }

                                            </span>

                                        </div>


                                        {/* REVENUE */}

                                        <div className="staff-product-revenue">

                                            {
                                                formatCurrency(
                                                    product.totalRevenue ??
                                                    product.revenue ??
                                                    0
                                                )
                                            }

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}


export default StaffDashboard;