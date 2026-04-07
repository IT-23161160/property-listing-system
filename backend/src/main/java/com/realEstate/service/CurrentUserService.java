package com.realEstate.service;

import com.realEstate.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserService userService;

    public CurrentUserService(UserService userService) {
        this.userService = userService;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }

        return userService.getUserByEmail(authentication.getName());
    }
}
