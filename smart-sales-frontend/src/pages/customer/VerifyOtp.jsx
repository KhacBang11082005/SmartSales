import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

import logo from "../../assets/logo.png";

import api from "../../services/api";

import "./Login.css";


function VerifyOtp() {

    const navigate = useNavigate();


    const email =
        sessionStorage.getItem(
            "resetEmail"
        );


    const [otp, setOtp] =
        useState("");


    const [error, setError] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        if (!email) {

            navigate(
                "/forgot-password"
            );

            return;
        }


        if (!/^\d{6}$/.test(otp)) {

            setError(
                "Mã OTP phải gồm 6 chữ số."
            );

            setLoading(false);

            return;
        }


        try {

            await api.post(
                "/auth/verify-otp",
                {
                    email,
                    otp
                }
            );


            sessionStorage.setItem(
                "resetOtp",
                otp
            );


            navigate(
                "/reset-password"
            );


        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Mã OTP không chính xác."
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
                        Xác nhận OTP
                    </h1>

                    <p>
                        Nhập mã OTP đã được gửi đến email
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                >

                    <div className="login-field">

                        <label>
                            Mã OTP
                        </label>

                        <div className="input-wrapper">

                            <ShieldCheck size={19} />

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={otp}
                                onChange={(event) =>
                                    setOtp(
                                        event.target.value
                                            .replace(/\D/g, "")
                                    )
                                }
                                placeholder="Nhập mã OTP 6 số"
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
                            ? "Đang xác nhận..."
                            : "Xác nhận OTP"
                        }

                    </button>

                </form>


                <div className="login-register">

                    <span>
                        Chưa nhận được mã?
                    </span>

                    <Link to="/forgot-password">
                        Gửi lại
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


export default VerifyOtp;