package com.smartsales.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // =====================================================
        // FRONTEND REACT
        // =====================================================

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );


        // =====================================================
        // HTTP METHODS
        // =====================================================

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        // =====================================================
        // REQUEST HEADERS
        // =====================================================

        configuration.setAllowedHeaders(
                List.of("*")
        );


        // =====================================================
        // CREDENTIALS
        // =====================================================

        configuration.setAllowCredentials(true);


        // =====================================================
        // REGISTER CORS
        // =====================================================

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}