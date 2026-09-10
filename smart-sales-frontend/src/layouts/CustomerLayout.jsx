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
        cartCount
    } = useCart();

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const data = await getCategories();

                console.log(
                    "📂 CATEGORIES FROM API:",
                    data
                );

                setCategories(
                    Array.isArray(data) ? data : []
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
    // =========================
    // ĐĂNG XUẤT
    // =========================

    const handleLogout = () => {

        logout();

        navigate("/");

    };


    return (

        <div className="customer-layout">

            {/* =========================
                HEADER
            ========================= */}

            <header className="customer-header">

                {/* LOGO */}

                <Link
                    to="/"
                    className="logo"
                >

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                </Link>


                {/* CATEGORY */}

                <div className="category-menu">

                    <button className="category-btn">

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

                        {/* =========================
                                DANH MỤC TỪ DATABASE
                            ========================= */}

                        {categories.map(category => (

                            <Link
                                key={category.id}
                                to={`/products?category=${encodeURIComponent(
                                    category.name
                                )}`}
                            >

                                {category.name}

                            </Link>

                        ))}

                    </div>



                </div>


                {/* SEARCH */}

                <div className="header-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                    />

                </div>


                {/* ACTIONS */}

                <div className="header-actions">

                    {/* CART */}

                    <Link
                        to="/cart"
                        className="cart-btn"
                        aria-label="Giỏ hàng"
                    >

                        <ShoppingCart size={21} />

                        {cartCount > 0 && (

                            <span className="cart-badge">
                                {cartCount}
                            </span>

                        )}

                    </Link>


                    {/* ACCOUNT */}

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

                        /*
                         * ==================================
                         * USER MENU
                         * ==================================
                         */

                        <div className="user-area">

                            {/* TÊN TÀI KHOẢN */}

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


                            {/* DROPDOWN */}

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


            {/* =========================
                MAIN
            ========================= */}

            <main className="customer-main">

                <Outlet />

            </main>


            {/* =========================
                FOOTER
            ========================= */}

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