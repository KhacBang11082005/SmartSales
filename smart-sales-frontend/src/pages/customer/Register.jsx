
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Phone,
    ArrowLeft
} from "lucide-react";

import logo from "../../assets/logo.png";
import api from "../../services/api";
import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // THAY ĐỔI INPUT
    // =====================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        setError("");
    };


    // =====================================================
    // ĐĂNG KÝ
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        // Kiểm tra dữ liệu

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {

            setError(
                "Vui lòng nhập đầy đủ thông tin."
            );

            return;
        }


        // Kiểm tra số điện thoại

        if (
            !/^0\d{9,10}$/.test(
                form.phone.trim()
            )
        ) {

            setError(
                "Số điện thoại không hợp lệ."
            );

            return;
        }


        // Kiểm tra password

        if (
            form.password.length < 6
        ) {

            setError(
                "Mật khẩu phải có ít nhất 6 ký tự."
            );

            return;
        }


        // Kiểm tra confirm password

        if (
            form.password !==
            form.confirmPassword
        ) {

            setError(
                "Mật khẩu nhập lại không khớp."
            );

            return;
        }


        try {

            setLoading(true);


            console.log(
                "Đang gửi dữ liệu đăng ký:",
                form
            );


            // =================================================
            // GỌI BACKEND
            // =================================================

            const response = await api.post(
                "/auth/register",
                {
                    fullName: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    password: form.password,
                    confirmPassword: form.confirmPassword
                }
            );


            console.log(
                "Đăng ký thành công:",
                response.data
            );


            // Xóa dữ liệu đăng nhập cũ

            localStorage.removeItem("token");
            localStorage.removeItem("smart_sales_user");


            alert(
                "Đăng ký tài khoản thành công!"
            );


            // Chuyển sang Login

            navigate("/login");


        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );


            // Backend trả lỗi

            const message =
                error.response?.data?.message;


            if (message) {

                setError(message);

            } else if (
                error.response?.status === 404
            ) {

                setError(
                    "Không tìm thấy API đăng ký. Hãy kiểm tra Backend."
                );

            } else if (
                error.response?.status === 400
            ) {

                setError(
                    "Thông tin đăng ký không hợp lệ."
                );

            } else {

                setError(
                    "Không thể kết nối đến máy chủ. Hãy kiểm tra Backend có đang chạy không."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="register-page">

            <div className="register-card">

                {/* LOGO */}

                <div className="register-logo">

                    <img
                        src={logo}
                        alt="Smart Sales"
                    />

                    <h1>
                        Tạo tài khoản
                    </h1>

                    <p>
                        Đăng ký để bắt đầu mua sắm
                    </p>

                </div>


                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    {/* NAME */}

                    <div className="register-field">

                        <label>
                            Họ và tên
                        </label>

                        <div className="register-input">

                            <User size={19} />

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                            />

                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="register-field">

                        <label>
                            Email
                        </label>

                        <div className="register-input">

                            <Mail size={19} />

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                            />

                        </div>

                    </div>


                    {/* PHONE */}

                    <div className="register-field">

                        <label>
                            Số điện thoại
                        </label>

                        <div className="register-input">

                            <Phone size={19} />

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />

                        </div>

                    </div>


                    {/* PASSWORD */}

                    <div className="register-field">

                        <label>
                            Mật khẩu
                        </label>

                        <div className="register-input">

                            <Lock size={19} />

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                            />

                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="register-field">

                        <label>
                            Nhập lại mật khẩu
                        </label>

                        <div className="register-input">

                            <Lock size={19} />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                            />

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="register-error">
                            {error}
                        </div>

                    )}


                    {/* BUTTON */}

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Đang tạo tài khoản..."
                            : "Đăng ký"
                        }

                    </button>

                </form>


                {/* LOGIN */}

                <div className="register-login">

                    <span>
                        Đã có tài khoản?
                    </span>

                    <Link to="/login">
                        Đăng nhập
                    </Link>

                </div>


                {/* BACK */}

                <Link
                    to="/products"
                    className="register-back"
                >

                    <ArrowLeft size={17} />

                    Quay lại mua hàng

                </Link>

            </div>

        </div>
    );
}

export default Register;

