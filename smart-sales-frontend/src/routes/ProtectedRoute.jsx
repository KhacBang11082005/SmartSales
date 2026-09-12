import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


// =====================================================
// NORMALIZE ROLE
// =====================================================

function normalizeRole(role) {

    if (!role) {
        return "";
    }

    return String(role)
        .replace("ROLE_", "")
        .toUpperCase()
        .trim();

}


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({
                            children,
                            allowedRoles
                        }) {

    const {
        user,
        isLoggedIn
    } = useAuth();


    // =================================================
    // CHƯA ĐĂNG NHẬP
    // =================================================

    if (!isLoggedIn || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =================================================
    // ROLE HIỆN TẠI
    // =================================================

    const currentRole =
        normalizeRole(user.role);


    // =================================================
    // KIỂM TRA QUYỀN
    // =================================================

    const normalizedAllowedRoles =
        allowedRoles?.map(
            normalizeRole
        );


    const hasPermission =
        !normalizedAllowedRoles ||
        normalizedAllowedRoles.includes(
            currentRole
        );


    // =================================================
    // CÓ QUYỀN
    // =================================================

    if (hasPermission) {

        return children;

    }


    // =================================================
    // KHÔNG CÓ QUYỀN
    //
    // Không đưa về "/" nữa.
    //
    // ADMIN    → /admin
    // EMPLOYEE → /staff
    // CUSTOMER → /
    // =================================================

    if (currentRole === "ADMIN") {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );

    }


    if (
        currentRole === "EMPLOYEE" ||
        currentRole === "STAFF"
    ) {

        return (
            <Navigate
                to="/staff"
                replace
            />
        );

    }


    if (currentRole === "CUSTOMER") {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // =================================================
    // ROLE KHÔNG XÁC ĐỊNH
    // =================================================

    return (
        <Navigate
            to="/login"
            replace
        />
    );

}


export default ProtectedRoute;