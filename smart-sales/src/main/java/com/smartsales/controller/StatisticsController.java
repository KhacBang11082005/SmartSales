package com.smartsales.controller;

import com.smartsales.dto.DashboardStatistics;
import com.smartsales.dto.TopProductStatistics;
import com.smartsales.service.StatisticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(
            StatisticsService statisticsService) {

        this.statisticsService = statisticsService;
    }

    @GetMapping("/dashboard")
    public DashboardStatistics getDashboardStatistics() {

        return statisticsService.getDashboardStatistics();
    }

    @GetMapping("/top-products")
    public List<TopProductStatistics> getTopSellingProducts() {

        return statisticsService.getTopSellingProducts();
    }
}