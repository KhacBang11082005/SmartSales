package com.smartsales.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // CUSTOMER
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;


    // =====================================================
    // SHIPPING INFORMATION
    // =====================================================

    @Column(name = "shipping_name", length = 150)
    private String shippingName;

    @Column(name = "shipping_phone", length = 20)
    private String shippingPhone;

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "shipping_note", length = 500)
    private String shippingNote;


    // =====================================================
    // ORDER INFORMATION
    // =====================================================

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal totalAmount = BigDecimal.ZERO;


    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;


    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;


    // =====================================================
    // ORDER DETAILS
    // =====================================================

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OrderDetail> orderDetails =
            new ArrayList<>();


    // =====================================================
    // STATUS
    // =====================================================

    public enum Status {
        PENDING,
        CONFIRMED,
        PROCESSING,
        COMPLETED,
        CANCELLED
    }


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Order() {
    }


    // =====================================================
    // GETTER / SETTER
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }


    // =====================================================
    // SHIPPING GETTER / SETTER
    // =====================================================

    public String getShippingName() {
        return shippingName;
    }

    public void setShippingName(String shippingName) {
        this.shippingName = shippingName;
    }


    public String getShippingPhone() {
        return shippingPhone;
    }

    public void setShippingPhone(String shippingPhone) {
        this.shippingPhone = shippingPhone;
    }


    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }


    public String getShippingNote() {
        return shippingNote;
    }

    public void setShippingNote(String shippingNote) {
        this.shippingNote = shippingNote;
    }


    // =====================================================
    // ORDER GETTER / SETTER
    // =====================================================

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }


    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }


    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(
            List<OrderDetail> orderDetails) {

        this.orderDetails = orderDetails;
    }
}