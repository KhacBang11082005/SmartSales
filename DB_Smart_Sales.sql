CREATE DATABASE IF NOT EXISTS smart_sales
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_sales;

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED')
        DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE')
        DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    image_url VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE')
        DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_product_price
        CHECK (price >= 0)
);

CREATE TABLE inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_inventory_quantity
        CHECK (quantity >= 0)
);

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status ENUM(
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_order_total
        CHECK (total_amount >= 0)
);

CREATE TABLE order_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_order_details_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_order_details_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_order_detail_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_detail_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_detail_subtotal
        CHECK (subtotal >= 0)
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM(
        'CASH',
        'BANK_TRANSFER',
        'CREDIT_CARD',
        'E_WALLET'
    ) NOT NULL,
    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
);

CREATE TABLE ai_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_conversations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

INSERT INTO roles (name, description)
VALUES
('ADMIN', 'Quản trị viên hệ thống'),
('EMPLOYEE', 'Nhân viên bán hàng'),
('CUSTOMER', 'Khách hàng');

INSERT INTO categories (name, description)
VALUES
('Laptop', 'Máy tính xách tay'),
('Điện thoại', 'Điện thoại thông minh'),
('Phụ kiện', 'Phụ kiện công nghệ');

INSERT INTO products
(category_id, name, description, price, image_url)
VALUES
(1, 'Laptop Dell Inspiron', 'Laptop phục vụ học tập và làm việc', 15990000, NULL),
(1, 'Laptop ASUS Vivobook', 'Laptop mỏng nhẹ', 14990000, NULL),
(2, 'Samsung Galaxy A55', 'Điện thoại Samsung Galaxy A55', 8990000, NULL),
(2, 'iPhone 15', 'Điện thoại Apple iPhone 15', 18990000, NULL),
(3, 'Chuột Logitech', 'Chuột không dây Logitech', 450000, NULL),
(3, 'Bàn phím cơ', 'Bàn phím cơ gaming', 890000, NULL);


select*from roles;
SELECT * FROM categories;
SELECT * FROM products





-- INDEX dùng sau khi có nhiều dữ liệu

-- CREATE INDEX idx_users_role
-- ON users(role_id);

-- CREATE INDEX idx_products_category
-- ON products(category_id);

-- CREATE INDEX idx_orders_customer
-- ON orders(customer_id);

-- CREATE INDEX idx_orders_status
-- ON orders(status);

-- CREATE INDEX idx_orders_date
-- ON orders(order_date);

-- CREATE INDEX idx_order_details_order
-- ON order_details(order_id);

-- CREATE INDEX idx_order_details_product
-- ON order_details(product_id);

-- CREATE INDEX idx_payments_status
-- ON payments(payment_status);

-- CREATE INDEX idx_ai_conversations_user
-- ON ai_conversations(user_id);

-- CREATE INDEX idx_ai_conversations_created_at
-- ON ai_conversations(created_at);