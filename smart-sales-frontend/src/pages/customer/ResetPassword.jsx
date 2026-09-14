import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

import logo from "../../assets/logo.png";

import api from "../../services/api";

import "./Login.css";


function ResetPassword() {

    const navigate = useNavigate();


    const email =
        sessionStorage.getItem(
            "resetEmail"
        );


    const otp =
        sessionStorage.getItem(
            "resetOtp"
        );


    const [newPassword, setNewPassword] =
        useState("");


    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");

        setLoading(true);


        if (!email || !otp) {

            navigate(
                "/forgot-password"
            );

            return;
        }


        if (!newPassword || !confirmPassword) {

            setError(
                "Vui lòng nhập đầy đủ mật khẩu."
            );

            setLoading(false);

            return;
        }


        if (newPassword.length < 6) {

            setError(
                "Mật khẩu phải có ít nhất 6 ký tự."
            );

            setLoading(false);

            return;
        }


        if (newPassword !== confirmPassword) {

            setError(
                "Mật khẩu nhập lại không khớp."
            );

            setLoading(false);

            return;
        }


        try {

            await api.post(
                "/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword,
                    confirmPassword
                }
            );


            sessionStorage.removeItem(
                "resetEmail"
            );

            sessionStorage.removeItem(
                "resetOtp"
            );


            setSuccess(
                "Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập..."
            );


            setTimeout(() => {

                navigate(
                    "/login"
                );

            }, 1500);


        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Không thể đặt lại mật khẩu."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            <div className="login-card">


                <div className="login-logo">

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                    <h1>
                        Đặt lại mật khẩu
                    </h1>

                    <p>
                        Tạo mật khẩu mới cho tài khoản
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                >


                    {/* MẬT KHẨU MỚI */}

                    <div className="login-field">

                        <label>
                            Mật khẩu mới
                        </label>

                        <div className="input-wrapper">

                            <Lock size={19} />

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Nhập mật khẩu mới"
                            />

                        </div>

                    </div>


                    {/* NHẬP LẠI */}

                    <div className="login-field">

                        <label>
                            Nhập lại mật khẩu
                        </label>

                        <div className="input-wrapper">

                            <Lock size={19} />

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Nhập lại mật khẩu"
                            />

                        </div>

                    </div>


                    {error && (

                        <div className="login-error">

                            {error}

                        </div>

                    )}


                    {success && (

                        <div
                            className="login-success"
                        >

                            {success}

                        </div>

                    )}


                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Đang cập nhật..."
                            : "Đổi mật khẩu"
                        }

                    </button>

                </form>


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


export default ResetPassword;