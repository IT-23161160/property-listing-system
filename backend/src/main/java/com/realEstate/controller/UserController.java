package com.realEstate.controller;

import com.realEstate.dto.ChangePasswordRequest;
import com.realEstate.dto.UserResponse;
import com.realEstate.model.User;
import com.realEstate.service.CurrentUserService;
import com.realEstate.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(UserResponse.from(currentUserService.getCurrentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@RequestBody User updatedUser) {
        User current = currentUserService.getCurrentUser();
        updatedUser.setRole(current.getRole());
        User updated = userService.updateUser(current.getUserId(), updatedUser);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        User current = currentUserService.getCurrentUser();
        userService.changePassword(current.getUserId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteCurrentUser() {
        User current = currentUserService.getCurrentUser();
        userService.deleteUser(current.getUserId());
        return ResponseEntity.ok("Account deleted successfully");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream().map(UserResponse::from).collect(Collectors.toList())
        );
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(UserResponse.from(userService.getUserById(userId)));
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable String userId,
            @RequestParam String newRole) {
        return ResponseEntity.ok(UserResponse.from(userService.updateUserRole(userId, newRole)));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/sellers")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllSellers() {
        return ResponseEntity.ok(
                userService.getAllSellers().stream().map(UserResponse::from).collect(Collectors.toList())
        );
    }

    @GetMapping("/admins")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(
                userService.getAllAdmins().stream().map(UserResponse::from).collect(Collectors.toList())
        );
    }
}