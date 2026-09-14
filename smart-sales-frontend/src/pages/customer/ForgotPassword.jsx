import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

import logo from "../../assets/logo.png";

import api from "../../services/api";

import "./Login.css";


function ForgotPassword() {

    const navigate = useNavigate();


    const [email, setEmail] =
        useState("");


    const [error, setError] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // GỬI OTP
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        if (!email.trim()) {

            setError(
                "Vui lòng nhập email."
            );

            setLoading(false);

            return;
        }


        try {

            await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim()
                }
            );


            // Lưu email tạm thời
            sessionStorage.setItem(
                "resetEmail",
                email.trim()
            );


            navigate(
                "/verify-otp"
            );


        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Không thể gửi mã OTP. Vui lòng thử lại."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* LOGO */}

                <div className="login-logo">

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                    <h1>
                        Quên mật khẩu
                    </h1>

                    <p>
                        Nhập email để nhận mã OTP
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                >

                    <div className="login-field">

                        <label>
                            Email
                        </label>

                        <div className="input-wrapper">

                            <Mail size={19} />

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Nhập email của bạn"
                            />

                        </div>

                    </div>


                    {error && (

                        <div className="login-error">

                            {error}

                        </div>

                    )}


                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Đang gửi mã..."
                            : "Gửi mã OTP"
                        }

                    </button>

                </form>


                <div className="login-register">

                    <span>
                        Nhớ mật khẩu?
                    </span>

                    <Link to="/login">
                        Đăng nhập
                    </Link>

                </div>


                <Link
                    to="/login"
                    className="back-products"
                >

                    <ArrowLeft size={17} />

                    Quay lại đăng nhập

                </Link>

            </div>

        </div>
    );
}


export default ForgotPassword;