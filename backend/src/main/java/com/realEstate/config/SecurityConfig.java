package com.realEstate.config;

import com.realEstate.util.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Autowired
        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
                return configuration.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:4200"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                                                .exceptionHandling(ex -> ex
                                                                                                .authenticationEntryPoint((request, response, authException) ->
                                                                                                                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                                                                                                .accessDeniedHandler((request, response, accessDeniedException) ->
                                                                                                                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied"))
                                                                )
                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .anyRequest().authenticated()
                )
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

}
