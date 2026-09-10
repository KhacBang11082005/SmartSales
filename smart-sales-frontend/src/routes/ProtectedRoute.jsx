import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {

    const {
        user,
        isLoggedIn
    } = useAuth();


    // Chưa đăng nhập
    if (!isLoggedIn) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // Không có quyền
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    return children;
}

export default ProtectedRoute;