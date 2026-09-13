import {
    Outlet,
    Link,
    useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryApi";

import {
    ShoppingCart,
    User,
    LogOut,
    Menu,
    Search,
    ChevronDown,
    Package,
    CircleUserRound
} from "lucide-react";

import "./CustomerLayout.css";

import logo from "../assets/logo.png";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";


function CustomerLayout() {

    const {
        user,
        isLoggedIn,
        logout
    } = useAuth();


    const {
        cartItems
    } = useCart();


    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);


    // ==========================================
    // TÍNH TỔNG SỐ LƯỢNG SẢN PHẨM TRONG GIỎ
    // ==========================================
    //
    // Ví dụ:
    //
    // Sony × 14
    // Dell × 10
    //
    // Badge = 24
    //
    // Nếu giỏ hàng trống:
    // Badge không hiển thị
    //
    // ==========================================

    const cartCount = cartItems.reduce(
        (total, item) => {
            return total + Number(item.quantity || 0);
        },
        0
    );


    // ==========================================
    // LẤY DANH MỤC
    // ==========================================

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const data =
                    await getCategories();


                console.log(
                    "📂 CATEGORIES FROM API:",
                    data
                );


                setCategories(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "❌ Không thể lấy danh mục:",
                    error
                );

            }

        };


        fetchCategories();

    }, []);


    // ==========================================
    // DEBUG CART
    // ==========================================

    useEffect(() => {

        console.log(
            "🛒 CART HEADER:",
            cartItems
        );

        console.log(
            "🛒 TỔNG SỐ LƯỢNG:",
            cartCount
        );

    }, [
        cartItems,
        cartCount
    ]);


    // ==========================================
    // ĐĂNG XUẤT
    // ==========================================

    const handleLogout = () => {

        logout();

        navigate("/");

    };


    return (

        <div className="customer-layout">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="customer-header">


                {/* ==================================
                    LOGO
                ================================== */}

                <Link
                    to="/"
                    className="logo"
                >

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                </Link>


                {/* ==================================
                    CATEGORY
                ================================== */}

                <div className="category-menu">

                    <button
                        type="button"
                        className="category-btn"
                    >

                        <Menu size={19} />

                        <span>
                            Danh mục
                        </span>

                        <ChevronDown
                            size={16}
                            className="category-arrow"
                        />

                    </button>


                    <div className="category-dropdown">

                        {categories.map(
                            category => (

                                <Link
                                    key={category.id}
                                    to={`/products?category=${encodeURIComponent(
                                        category.name
                                    )}`}
                                >

                                    {category.name}

                                </Link>

                            )
                        )}

                    </div>

                </div>


                {/* ==================================
                    SEARCH
                ================================== */}

                <div className="header-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                    />

                </div>


                {/* ==================================
                    HEADER ACTIONS
                ================================== */}

                <div className="header-actions">


                    {/* ==================================
                        GIỎ HÀNG
                    ================================== */}

                    <Link
                        to="/cart"
                        className="cart-btn"
                        aria-label={
                            cartCount > 0
                                ? `Giỏ hàng, ${cartCount} sản phẩm`
                                : "Giỏ hàng"
                        }
                    >

                        <ShoppingCart
                            size={21}
                        />


                        {/* ==================================
                            BADGE SỐ LƯỢNG

                            Badge chỉ xuất hiện khi
                            giỏ hàng có sản phẩm.

                            Ví dụ:

                            Sony × 14
                            Dell × 10

                            → Badge = 24
                        ================================== */}

                        {cartCount > 0 && (

                            <span className="cart-badge">

                                {cartCount > 99
                                    ? "99+"
                                    : cartCount
                                }

                            </span>

                        )}

                    </Link>


                    {/* ==================================
                        CHƯA ĐĂNG NHẬP
                    ================================== */}

                    {!isLoggedIn ? (

                        <Link
                            to="/login"
                            className="login-btn"
                        >

                            <User size={19} />

                            <span>
                                Đăng nhập
                            </span>

                        </Link>

                    ) : (

                        /* ==================================
                           USER ĐÃ ĐĂNG NHẬP
                        ================================== */

                        <div className="user-area">


                            {/* USER INFO */}

                            <div className="user-info">

                                <User size={19} />

                                <span>

                                    {user?.name ||
                                        user?.fullName ||
                                        user?.username ||
                                        "Tài khoản"}

                                </span>

                                <ChevronDown
                                    size={16}
                                    className="user-arrow"
                                />

                            </div>


                            {/* USER DROPDOWN */}

                            <div className="user-dropdown">


                                {/* THÔNG TIN TÀI KHOẢN */}

                                <Link
                                    to="/account"
                                    className="user-dropdown-item"
                                >

                                    <CircleUserRound
                                        size={18}
                                    />

                                    <span>
                                        Thông tin tài khoản
                                    </span>

                                </Link>


                                {/* XEM ĐƠN HÀNG */}

                                <Link
                                    to="/orders"
                                    className="user-dropdown-item"
                                >

                                    <Package
                                        size={18}
                                    />

                                    <span>
                                        Xem đơn hàng
                                    </span>

                                </Link>


                                {/* ĐƯỜNG KẺ */}

                                <div className="user-dropdown-divider" />


                                {/* ĐĂNG XUẤT */}

                                <button
                                    type="button"
                                    className="user-dropdown-item logout-dropdown-item"
                                    onClick={handleLogout}
                                >

                                    <LogOut
                                        size={18}
                                    />

                                    <span>
                                        Đăng xuất
                                    </span>

                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="customer-main">

                <Outlet />

            </main>


            {/* ==================================
                FOOTER
            ================================== */}

            <footer className="customer-footer">

                <h3>
                    Smart Sales
                </h3>

                <p>
                    Hệ thống quản lý bán hàng thông minh
                </p>

                <p>
                    © 2026 Smart Sales
                </p>

            </footer>

        </div>

    );

}


export default CustomerLayout;