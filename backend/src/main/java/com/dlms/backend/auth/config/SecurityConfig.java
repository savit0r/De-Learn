
package com.dlms.backend.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Allow EVERYTHING for debugging 403
                        .requestMatchers("/**").permitAll()
                        .anyRequest().permitAll())
                // Allow frames for H2 console
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        // Allow localhost and local IP on any port (3000, 5173, 5174, etc.)
        java.util.List<String> originPatterns = new java.util.ArrayList<>();
        originPatterns.add("http://localhost:*");
        originPatterns.add("http://127.0.0.1:*");
        originPatterns.add("https://monolithic-lms.onrender.com");
        originPatterns.add("https://*.onrender.com");
        originPatterns.add("https://*.vercel.app");

        String envAllowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (envAllowedOrigins != null && !envAllowedOrigins.isEmpty()) {
            String[] envOrigins = envAllowedOrigins.split(",");
            for (String origin : envOrigins) {
                originPatterns.add(origin.trim());
            }
        }

        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
