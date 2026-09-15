package com.smartsales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication

// =========================================================
// BẬT SCHEDULER
//
// Cho phép Spring chạy các method có:
// @Scheduled
//
// Scheduler được sử dụng để tự động kiểm tra
// khách hàng không đăng nhập quá 7 ngày.
// =========================================================
@EnableScheduling
public class SmartSalesApplication {

	public static void main(String[] args) {

		SpringApplication.run(
				SmartSalesApplication.class,
				args
		);
	}
}