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

import logo from "../../assets/logo.png";

import "./StaffLayout.css";


function StaffLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);


    // =====================================================
    // MENU NHÂN VIÊN
    // =====================================================

    const menuItems = [

        {
            to: "/staff",
            label: "Dashboard",
            end: true
        },

        {
            to: "/staff/orders",
            label: "Đơn hàng"
        },

        {
            to: "/staff/customers",
            label: "Khách hàng"
        },

        {
            to: "/staff/products",
            label: "Sản phẩm"
        },

        {
            to: "/staff/categories",
            label: "Danh mục"
        }

    ];


    // =====================================================
    // XÁC ĐỊNH TRANG HIỆN TẠI
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
    // THÔNG TIN NHÂN VIÊN
    // =====================================================

    const staffName =
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Nhân viên";


    const staffInitial =
        staffName
            .charAt(0)
            .toUpperCase();


    return (

        <div className="staff-layout">


            {/* =================================================
                OVERLAY MOBILE
            ================================================= */}

            {sidebarOpen && (

                <div
                    className="staff-sidebar-overlay"
                    onClick={closeSidebar}
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={
                    `staff-sidebar ${
                        sidebarOpen
                            ? "staff-sidebar-open"
                            : ""
                    }`
                }
            >


                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="staff-logo">

                    <img
                        src={logo}
                        alt="SmartSales"
                        className="staff-logo-image"
                    />


                    {/* Nút đóng sidebar trên mobile */}

                    <button
                        type="button"
                        className="staff-sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Đóng menu"
                    >

                        <X size={19} />

                    </button>

                </div>


                {/* =================================================
                    MENU
                ================================================= */}

                <nav className="staff-menu">

                    <div className="staff-menu-heading">

                        <span>
                            BÁN HÀNG
                        </span>

                    </div>


                    <div className="staff-menu-list">

                        {menuItems.map((item) => (

                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `staff-menu-item ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={closeSidebar}
                            >

                                <span className="staff-menu-label">

                                    {item.label}

                                </span>


                                <ChevronRight
                                    className="staff-menu-arrow"
                                    size={16}
                                />

                            </NavLink>

                        ))}

                    </div>

                </nav>


                {/* =================================================
                    SIDEBAR BOTTOM
                ================================================= */}

                <div className="staff-sidebar-bottom">

                    <button
                        type="button"
                        className="staff-logout"
                        onClick={handleLogout}
                    >

                        <LogOut size={18} />

                        <span>
                            Đăng xuất
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="staff-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="staff-header">


                    {/* Mobile menu */}

                    <button
                        type="button"
                        className="staff-mobile-menu"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        aria-label="Mở menu"
                    >

                        <Menu size={21} />

                    </button>


                    {/* =================================================
                        HEADER LEFT
                    ================================================= */}

                    <div className="staff-header-left">


                        {/* Breadcrumb */}

                        <div className="staff-breadcrumb">

                            <span>
                                BÁN HÀNG
                            </span>

                            <ChevronRight
                                size={13}
                            />

                            <strong>
                                {currentItem.label}
                            </strong>

                        </div>


                        {/* Page title */}

                        <div className="staff-header-page-title">

                            <h1>
                                {currentItem.label}
                            </h1>

                        </div>

                    </div>


                    {/* =================================================
                        STAFF INFO
                    ================================================= */}

                    <div className="staff-header-user">

                        <div className="staff-header-avatar">

                            {staffInitial}

                        </div>


                        <div className="staff-header-user-info">

                            <strong>
                                {staffName}
                            </strong>

                            <span>
                                NHÂN VIÊN
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="staff-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default StaffLayout;