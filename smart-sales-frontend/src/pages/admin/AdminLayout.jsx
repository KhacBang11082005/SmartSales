import {
    LogOut,
    Menu,
    X,
    ChevronRight
} from "lucide-react";

import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import smartSalesLogo from "../../assets/logo.png";

import "./AdminLayout.css";


function AdminLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);


    // =====================================================
    // MENU ADMIN
    // =====================================================
    const menuItems = [
        { to: "/admin", label: "Dashboard", end: true },

        { to: "/admin/products", label: "Quản lý sản phẩm" },

        { to: "/admin/categories", label: "Quản lý danh mục" },

        { to: "/admin/customers", label: "Quản lý khách hàng" },

        { to: "/admin/orders", label: "Quản lý đơn hàng" },

        // =====================================================
        // KHUYẾN MẠI
        // =====================================================
        {
            to: "/admin/promotions",
            label: "Quản lý khuyến mại"
        },

        { to: "/admin/users", label: "Quản lý nhân viên" }
    ];


    // =====================================================
    // TRANG HIỆN TẠI
    // =====================================================

    const currentItem =
        menuItems.find((item) => {

            if (item.end) {
                return location.pathname === item.to;
            }

            return location.pathname.startsWith(item.to);

        }) || menuItems[0];


    // =====================================================
    // ĐĂNG XUẤT
    // =====================================================

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    // =====================================================
    // ĐÓNG SIDEBAR
    // =====================================================

    const closeSidebar = () => {

        setSidebarOpen(false);

    };


    // =====================================================
    // THÔNG TIN ADMIN
    // =====================================================

    const adminName =
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Administrator";


    const adminInitial =
        adminName
            .charAt(0)
            .toUpperCase();


    return (

        <div className="admin-layout">


            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (

                <div
                    className="admin-sidebar-overlay"
                    onClick={closeSidebar}
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={
                    `admin-sidebar ${
                        sidebarOpen
                            ? "admin-sidebar-open"
                            : ""
                    }`
                }
            >


                {/* =================================================
                    LOGO

                    Chỉ hiển thị logo.
                    Không có chữ SMARTSALES.
                ================================================= */}

                <div className="admin-logo">

                    <img
                        src={smartSalesLogo}
                        alt="SmartSales"
                        className="admin-logo-image"
                    />


                    {/* Nút đóng sidebar mobile */}

                    <button
                        type="button"
                        className="admin-sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Đóng menu"
                    >

                        <X size={19} />

                    </button>

                </div>


                {/* =================================================
                    MENU
                ================================================= */}

                <nav className="admin-menu">

                    <div className="admin-menu-heading">

                        <span>
                            QUẢN LÝ HỆ THỐNG
                        </span>

                    </div>


                    <div className="admin-menu-list">

                        {menuItems.map((item) => (

                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `admin-menu-item ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={closeSidebar}
                            >

                                <span className="admin-menu-label">

                                    {item.label}

                                </span>


                                <ChevronRight
                                    className="admin-menu-arrow"
                                    size={15}
                                />

                            </NavLink>

                        ))}

                    </div>

                </nav>


                {/* =================================================
                    ĐĂNG XUẤT
                ================================================= */}

                <div className="admin-sidebar-bottom">

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >

                        <LogOut size={17} />

                        <span>
                            Đăng xuất
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="admin-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="admin-header">


                    {/* Mobile menu */}

                    <button
                        type="button"
                        className="admin-mobile-menu"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        aria-label="Mở menu"
                    >

                        <Menu size={20} />

                    </button>


                    {/* =================================================
                        HEADER LEFT
                    ================================================= */}

                    <div className="admin-header-left">

                        <div className="admin-breadcrumb">

                            <span>
                                SMARTSALES
                            </span>

                            <ChevronRight size={13} />

                            <strong>
                                {currentItem.label}
                            </strong>

                        </div>


                        <div className="admin-header-page-title">

                            <h1>
                                {currentItem.label}
                            </h1>

                        </div>

                    </div>


                    {/* =================================================
                        ADMIN USER
                    ================================================= */}

                    <div className="admin-header-user">

                        <div className="admin-header-avatar">

                            {adminInitial}

                        </div>


                        <div className="admin-header-user-info">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                ADMIN
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="admin-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default AdminLayout;