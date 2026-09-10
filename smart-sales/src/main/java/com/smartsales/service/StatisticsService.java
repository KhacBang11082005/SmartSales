package com.smartsales.service;

import com.smartsales.dto.DashboardStatistics;
import com.smartsales.dto.TopProductStatistics;
import com.smartsales.entity.Order;
import com.smartsales.repository.StatisticsRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;

    public StatisticsService(
            StatisticsRepository statisticsRepository) {

        this.statisticsRepository = statisticsRepository;
    }

    public DashboardStatistics getDashboardStatistics() {

        DashboardStatistics statistics =
                new DashboardStatistics();

        // Tổng số đơn
        statistics.setTotalOrders(
                statisticsRepository.countTotalOrders()
        );

        // Đơn hoàn thành
        statistics.setCompletedOrders(
                statisticsRepository.countOrdersByStatus(
                        Order.Status.COMPLETED
                )
        );

        // Doanh thu
        BigDecimal revenue =
                statisticsRepository.getTotalRevenue();

        statistics.setTotalRevenue(revenue);

        // Số sản phẩm đã bán
        statistics.setTotalProductsSold(
                statisticsRepository.getTotalProductsSold()
        );

        // PENDING
        statistics.setPendingOrders(
                statisticsRepository.countOrdersByStatus(
                        Order.Status.PENDING
                )
        );

        // CONFIRMED
        statistics.setConfirmedOrders(
                statisticsRepository.countOrdersByStatus(
                        Order.Status.CONFIRMED
                )
        );

        // PROCESSING
        statistics.setProcessingOrders(
                statisticsRepository.countOrdersByStatus(
                        Order.Status.PROCESSING
                )
        );

        // CANCELLED
        statistics.setCancelledOrders(
                statisticsRepository.countOrdersByStatus(
                        Order.Status.CANCELLED
                )
        );

        return statistics;
    }
    // TOP SẢN PHẩm bán chạy
    public List<TopProductStatistics> getTopSellingProducts() {

        return statisticsRepository.findTopSellingProducts(
                PageRequest.of(0, 5)
        );
    }
}