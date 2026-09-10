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

import "./AdminLayout.css";


function AdminLayout() {

    const navigate = useNavigate();
    const location = useLocation();

    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);


    // =====================================================
    // MENU ADMIN
    //
    // Thiết kế mới:
    // - Không sử dụng icon trước từng chức năng.
    // - Không sử dụng description dài.
    // - Tên chức năng hiển thị trực tiếp, dễ nhìn.
    // =====================================================

    const menuItems = [

        {
            to: "/admin",
            label: "Dashboard",
            end: true
        },

        {
            to: "/admin/products",
            label: "Quản lý sản phẩm"
        },

        {
            to: "/admin/categories",
            label: "Quản lý danh mục"
        },

        {
            to: "/admin/customers",
            label: "Quản lý khách hàng"
        },

        {
            to: "/admin/orders",
            label: "Quản lý đơn hàng"
        },

        {
            to: "/admin/users",
            label: "Quản lý nhân viên"
        }

    ];


    // =====================================================
    // XÁC ĐỊNH TRANG ĐANG MỞ
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
    // ĐÓNG SIDEBAR TRÊN MOBILE
    // =====================================================

    const closeSidebar = () => {

        setSidebarOpen(false);

    };


    // =====================================================
    // LẤY TÊN ADMIN
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
                OVERLAY MOBILE

                Khi sidebar mở trên điện thoại,
                click ra ngoài sẽ đóng sidebar.
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
                ================================================= */}

                <div className="admin-logo">

                    <div className="admin-logo-mark">

                        <span>
                            SS
                        </span>

                    </div>


                    <div className="admin-logo-text">

                        <strong>
                            SMART<span>SALES</span>
                        </strong>

                        <small>
                            ADMIN CONSOLE
                        </small>

                    </div>


                    {/* Nút đóng menu trên mobile */}

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
                    THÔNG TIN ADMIN
                ================================================= */}

                <div className="admin-sidebar-profile">

                    <div className="admin-profile-avatar">

                        {adminInitial}

                    </div>


                    <div className="admin-profile-info">

                        <strong>
                            {adminName}
                        </strong>

                        <span>
                            Quản trị viên
                        </span>

                    </div>

                </div>


                {/* =================================================
                    MENU ADMIN

                    Không còn icon trước chức năng.
                    Không còn description.
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

                                {/* Tên chức năng */}

                                <span className="admin-menu-label">

                                    {item.label}

                                </span>


                                {/* Mũi tên nhỏ bên phải */}

                                <ChevronRight
                                    className="admin-menu-arrow"
                                    size={15}
                                />

                            </NavLink>

                        ))}

                    </div>

                </nav>


                {/* =================================================
                    FOOTER SIDEBAR

                    Đã bỏ:
                    - Hệ thống an toàn
                    - Đang hoạt động

                    Chỉ giữ Đăng xuất.
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


                    {/* Nút mở sidebar trên mobile */}

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
                        BREADCRUMB + TÊN TRANG
                    ================================================= */}

                    <div className="admin-header-left">

                        <div className="admin-breadcrumb">

                            <span>
                                SMARTSALES
                            </span>

                            <ChevronRight
                                size={13}
                            />

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
                        ADMIN Ở GÓC PHẢI
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
                    NỘI DUNG TRANG
                ================================================= */}

                <main className="admin-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default AdminLayout;