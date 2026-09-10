
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext();


export function AuthProvider({ children }) {

    // ==========================================
    // LOAD USER
    // ==========================================

    const [user, setUser] = useState(() => {

        try {

            const savedUser =
                localStorage.getItem("smart_sales_user");

            return savedUser
                ? JSON.parse(savedUser)
                : null;

        } catch (error) {

            console.error(
                "❌ Không thể đọc thông tin đăng nhập:",
                error
            );

            return null;
        }

    });


    // ==========================================
    // SAVE USER
    // ==========================================

    useEffect(() => {

        if (user) {

            localStorage.setItem(
                "smart_sales_user",
                JSON.stringify(user)
            );

        } else {

            localStorage.removeItem(
                "smart_sales_user"
            );

        }

    }, [user]);


    // ==========================================
    // LOGIN
    // ==========================================

    const login = async (username, password) => {

        try {

            console.log(
                "🔐 LOGIN REQUEST:",
                {
                    username,
                    password: "***"
                }
            );


            // ======================================
            // GỌI BACKEND
            // ======================================

            const response = await api.post(
                "/auth/login",
                {
                    username,
                    password
                }
            );


            const data = response.data;


            console.log(
                "✅ LOGIN RESPONSE:",
                data
            );


            // ======================================
            // KIỂM TRA TOKEN
            // ======================================

            if (!data || !data.token) {

                console.error(
                    "❌ Backend không trả về token:",
                    data
                );

                return null;
            }


            // ======================================
            // XÓA TOKEN CŨ
            // ======================================

            localStorage.removeItem("token");


            // ======================================
            // LƯU JWT
            // ======================================

            localStorage.setItem(
                "token",
                data.token
            );


            // ======================================
            // KIỂM TRA TOKEN ĐÃ LƯU
            // ======================================

            console.log(
                "🔑 TOKEN SAVED:",
                localStorage.getItem("token")
            );


            // ======================================
            // TẠO USER FRONTEND
            // ======================================
            const loggedInUser = {

                id: data.id,

                name:
                    data.fullName ||
                    data.username,

                fullName:
                    data.fullName ||
                    data.username,

                username:
                data.username,

                email:
                data.email,

                role:
                data.role,

                status:
                data.status
            };


            // ======================================
            // LƯU USER
            // ======================================

            setUser(
                loggedInUser
            );


            return loggedInUser;

        } catch (error) {

            console.error(
                "❌ LOGIN ERROR:",
                error
            );

            console.error(
                "❌ LOGIN RESPONSE:",
                error.response?.data
            );

            return null;
        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        setUser(null);

        localStorage.removeItem(
            "smart_sales_user"
        );

        localStorage.removeItem(
            "token"
        );

    };


    return (

        <AuthContext.Provider
            value={{

                user,

                isLoggedIn: !!user,

                login,

                logout

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    return useContext(AuthContext);

}

