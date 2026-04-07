package com.realEstate.service;

import com.realEstate.model.User;
import com.realEstate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        if (userRepository.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email " + user.getEmail() + " already in use");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole(User.ROLE_BUYER);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    public String getUserIdByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(User::getUserId)
                .orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    public User updateUser(String userId, User updatedUser) {
        User existingUser = getUserById(userId);

        if (updatedUser.getPassword() == null || updatedUser.getPassword().isEmpty()) {
            updatedUser.setPassword(existingUser.getPassword());
        } else if (!passwordEncoder.matches(updatedUser.getPassword(), existingUser.getPassword())) {
            updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        updatedUser.setUserId(userId);
        if (updatedUser.getRole() == null || updatedUser.getRole().isBlank()) {
            updatedUser.setRole(existingUser.getRole());
        }

        return userRepository.save(updatedUser);
    }

    public void deleteUser(String userId) {
        getUserById(userId);
        userRepository.deleteById(userId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User updateUserRole(String userId, String newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public List<User> getAllSellers() {
        return userRepository.findByRole(User.ROLE_SELLER);
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.ROLE_ADMIN);

    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

}