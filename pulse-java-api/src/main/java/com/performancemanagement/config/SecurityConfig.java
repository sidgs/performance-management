package com.performancemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Allow iframe embedding for widget mode (allow all origins)
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable())
                        .contentSecurityPolicy(csp -> csp.policyDirectives("frame-ancestors *"))
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints: JWT minting, login & OTP (adjust paths to your actual endpoints)
                        .requestMatchers("/jwt").permitAll()
                        .requestMatchers("/auth/login", "/auth/otp/**").permitAll()
                        // Health & actuator endpoints can remain public if desired
                        .requestMatchers("/actuator/**", "/health", "/health/**").permitAll()
                        // Everything else requires authentication via JWT
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow ALL origins - using allowedOriginPatterns allows "*" with credentials
        configuration.setAllowedOriginPatterns(List.of("*"));
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));
        // Expose all headers in response
        configuration.setExposedHeaders(List.of("*"));
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}


