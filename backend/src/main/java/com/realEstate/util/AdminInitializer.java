package com.realEstate.util;
import com.realEstate.model.User;
import com.realEstate.service.UserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements ApplicationRunner {
    private final UserService userService;

    public AdminInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String adminEmail = "admin@gmail.com";
        if (userService.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword("admin123");
            admin.setRole(User.ROLE_ADMIN);
            userService.registerUser(admin);
        }
    }
}
