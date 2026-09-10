import api from "./api";

/**
 * Lấy danh sách khách hàng
 */
export const getCustomers = async () => {
    const response = await api.get("/customers");
    return response.data;
};

/**
 * Lấy thông tin chi tiết khách hàng
 */
export const getCustomerById = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

/**
 * Cập nhật thông tin khách hàng từ Admin
 *
 * Chỉ cập nhật:
 * - Họ tên
 * - Số điện thoại
 * - Trạng thái
 *
 * Không cập nhật địa chỉ
 */
export const updateCustomer = async (id, data) => {
    const response = await api.put(
        `/customers/${id}`,
        {
            fullName: data.fullName,
            phone: data.phone,
            status: data.status
        }
    );

    return response.data;
};

/**
 * Xóa khách hàng
 */
export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};