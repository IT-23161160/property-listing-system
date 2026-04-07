package com.realEstate.dto;

import com.realEstate.model.User;

public class UserResponse {
    private String userId;
    private String name;
    private String email;
    private String role;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
