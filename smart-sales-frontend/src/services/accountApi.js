
import api from "./api";


// =========================================================
// LẤY THÔNG TIN TÀI KHOẢN
// =========================================================

export const getMyProfile = async () => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập."
        );
    }


    const response =
        await api.get(
            "/customers/me",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    return response.data;
};


// =========================================================
// CẬP NHẬT THÔNG TIN TÀI KHOẢN
// =========================================================

export const updateMyProfile = async (
    profile
) => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập."
        );
    }


    const response =
        await api.put(
            "/customers/me",
            profile,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    return response.data;
};


// =========================================================
// ĐỔI MẬT KHẨU
// =========================================================

export const changeMyPassword = async (
    passwordData
) => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập."
        );
    }


    const response =
        await api.put(
            "/customers/me/password",
            passwordData,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    return response.data;
};

