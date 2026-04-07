package com.realEstate.controller;

import com.realEstate.dto.AuthRequest;
import com.realEstate.dto.AuthResponse;
import com.realEstate.dto.RegisterRequest;
import com.realEstate.dto.UserResponse;
import com.realEstate.model.User;
import com.realEstate.service.CurrentUserService;
import com.realEstate.service.UserService;
import com.realEstate.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final CurrentUserService currentUserService;

    public AuthController(UserService userService, JwtUtil jwtUtil, CurrentUserService currentUserService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() == null || request.getRole().isBlank() ? User.ROLE_BUYER : request.getRole());

        User created = userService.registerUser(user);
        return ResponseEntity.ok(UserResponse.from(created));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userService.authenticate(request.getEmail(), request.getPassword())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole()))
        );

        String token = jwtUtil.generateToken(userDetails, Map.of(
                "role", user.getRole(),
                "userId", user.getUserId()
        ));

        return ResponseEntity.ok(new AuthResponse(token, UserResponse.from(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(UserResponse.from(currentUserService.getCurrentUser()));
    }
}
