import { useState } from "react";
import {
    Link,
    useNavigate,
    useLocation
} from "react-router-dom";
import { User, Lock, ArrowLeft } from "lucide-react";

import logo from "../../assets/logo.png";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";


function Login() {

    const navigate = useNavigate();

    const location = useLocation();

    const from =
        location.state?.from || "/";

    const { login } = useAuth();


    // ==========================================
    // FORM STATE
    // ==========================================

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // HANDLE LOGIN
    // ==========================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        // ======================================
        // KIỂM TRA DỮ LIỆU
        // ======================================

        if (!email.trim() || !password) {

            setError(
                "Vui lòng nhập đầy đủ email và mật khẩu."
            );

            setLoading(false);

            return;
        }


        try {

            // ==================================
            // GỌI BACKEND LOGIN
            // ==================================

            const loggedInUser =
                await login(
                    email.trim(),
                    password
                );


            // ==================================
            // ĐĂNG NHẬP THẤT BẠI
            // ==================================

            if (!loggedInUser) {

                setError(
                    "Email hoặc mật khẩu không chính xác."
                );

                setLoading(false);

                return;
            }


            // ==================================
            // LOGIN SUCCESS
            // ==================================

            console.log(
                "✅ Đăng nhập thành công:",
                loggedInUser
            );


            // ==================================
            // ĐIỀU HƯỚNG ADMIN
            // ==================================

            if (
                loggedInUser.role ===
                "ADMIN"
            ) {

                navigate("/admin");

                return;
            }


            // ==================================
            // ĐIỀU HƯỚNG STAFF / EMPLOYEE
            // ==================================

            if (
                loggedInUser.role ===
                    "STAFF" ||
                loggedInUser.role ===
                    "EMPLOYEE"
            ) {

                navigate("/staff");

                return;
            }


            // ==================================
            // CUSTOMER
            // Quay lại trang trước đó
            // ==================================

            navigate(from);

        }  catch (error) {

        // ==========================================
        // LOGIN ERROR
        // ==========================================

        console.error(
            "❌ LOGIN ERROR:",
            error
        );


        // ==========================================
        // HIỂN THỊ ĐÚNG MESSAGE BACKEND
        //
        // Ví dụ:
        //
        // Tài khoản của bạn đã bị khóa.
        // Vui lòng liên hệ quản trị viên.
        //
        // ==========================================

        setError(
            error.message ||
            "Không thể kết nối với máy chủ. Vui lòng thử lại."
        );

    } finally {

        setLoading(false);

    }

    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* ==================================
                    LOGO
                ================================== */}

                <div className="login-logo">

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                    <h1>
                        Đăng nhập
                    </h1>

                    <p>
                        Đăng nhập để tiếp tục mua sắm
                    </p>

                </div>


                {/* ==================================
                    FORM
                ================================== */}

                <form
                    onSubmit={handleLogin}
                >


                    {/* ==================================
                        EMAIL
                    ================================== */}

                    <div className="login-field">

                        <label>
                            Email
                        </label>

                        <div className="input-wrapper">

                            <User size={19} />

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Nhập email của bạn"
                                autoComplete="username"
                            />

                        </div>

                    </div>


                    {/* ==================================
                        PASSWORD
                    ================================== */}

                    <div className="login-field">

                        <label>
                            Mật khẩu
                        </label>

                        <div className="input-wrapper">

                            <Lock size={19} />

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                            />

                        </div>

                    </div>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="login-error">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        LOGIN BUTTON
                    ================================== */}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Đang đăng nhập..."
                            : "Đăng nhập"
                        }

                    </button>

                </form>

                <div className="login-bottom">
                {/* ==================================
                    REGISTER
                ================================== */}

                <div className="login-register">

                    <span>
                        Chưa có tài khoản?
                    </span>

                    <Link to="/register">
                        Đăng ký
                    </Link>

                </div>
                {/* ==================================
                        FORGOT PASSWORD
                    ================================== */}

                <div className="login-forgot">

                    <Link to="/forgot-password">
                        Quên mật khẩu?
                    </Link>

                </div>
                </div>

                {/* ==================================
                    BACK TO PRODUCTS
                ================================== */}

                <Link
                    to="/products"
                    className="back-products"
                >

                    <ArrowLeft size={17} />

                    Quay lại mua hàng

                </Link>

            </div>

        </div>

    );

}


export default Login;

