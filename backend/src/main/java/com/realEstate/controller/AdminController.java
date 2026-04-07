package com.realEstate.controller;

import com.realEstate.dto.BookingStatusRequest;
import com.realEstate.dto.UserResponse;
import com.realEstate.model.Booking;
import com.realEstate.model.Property;
import com.realEstate.model.User;
import com.realEstate.service.BookingService;
import com.realEstate.service.PropertyService;
import com.realEstate.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final PropertyService propertyService;
    private final BookingService bookingService;

    @Autowired
    public AdminController(UserService userService,
                           PropertyService propertyService,
                           BookingService bookingService) {
        this.userService = userService;
        this.propertyService = propertyService;
        this.bookingService = bookingService;
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> viewAllUsers() {
        List<User> users = userService.getAllUsers();

        Map<String, Integer> propertyCounts = new HashMap<>();
        for (User user : users) {
            if (user.getRole().equals("SELLER")) {
                propertyCounts.put(user.getUserId(),
                        propertyService.getPropertiesBySeller(user.getUserId()).size());
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("users", users.stream().map(UserResponse::from).collect(Collectors.toList()));
        payload.put("propertyCounts", propertyCounts);
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/properties")
    public ResponseEntity<List<Property>> viewAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> viewUserDetails(@PathVariable String userId) {
        User user = userService.getUserById(userId);
        List<Property> userProperties = propertyService.getPropertiesBySeller(userId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", UserResponse.from(user));
        payload.put("properties", userProperties);
        return ResponseEntity.ok(payload);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        if ("SELLER".equals(userService.getUserById(userId).getRole())) {
            List<Property> userProperties = propertyService.getPropertiesBySeller(userId);
            for (Property property : userProperties) {
                propertyService.deleteProperty(property.getPropertyId());
            }
        }

        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @DeleteMapping("/properties/{propertyId}")
    public ResponseEntity<String> deleteProperty(@PathVariable String propertyId) {
        propertyService.deleteProperty(propertyId);
        return ResponseEntity.ok("Property deleted successfully");
    }

    @PutMapping("/properties/{propertyId}/mark-sold")
    public ResponseEntity<Property> markPropertyAsSold(@PathVariable String propertyId) {
        return ResponseEntity.ok(propertyService.markPropertyAsSold(propertyId));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> viewAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();

        Map<String, String> propertyTitles = new HashMap<>();
        Map<String, String> buyerNames = new HashMap<>();
        Map<String, String> sellerNames = new HashMap<>();

        for (Booking booking : bookings) {
            Property property = propertyService.getPropertyById(booking.getPropertyId()).orElse(null);
            if (property != null) {
                propertyTitles.put(booking.getPropertyId(), property.getTitle());

                User seller = userService.getUserById(property.getSellerId());
                if (seller != null) {
                    sellerNames.put(booking.getPropertyId(), seller.getName());
                }
            }

            User buyer = userService.getUserById(booking.getBuyerId());
            if (buyer != null) {
                buyerNames.put(booking.getBuyerId(), buyer.getName());
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("bookings", bookings);
        payload.put("propertyTitles", propertyTitles);
        payload.put("buyerNames", buyerNames);
        payload.put("sellerNames", sellerNames);
        return ResponseEntity.ok(payload);
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<String> updateBookingStatus(@PathVariable("id") String requestId,
                                                      @RequestBody BookingStatusRequest request) {
        bookingService.updateBookingStatus(requestId, request.getStatus());
        return ResponseEntity.ok("Booking status updated");
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable("id") String requestId) {
        bookingService.deleteBooking(requestId);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    @PostMapping(value = "/properties", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Property> addPropertyAsAdmin(@RequestParam String title,
                                                       @RequestParam String description,
                                                       @RequestParam double price,
                                                       @RequestParam String location,
                                                       @RequestParam String categoryId,
                                                       @RequestParam(required = false) String sellerId,
                                                       @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            String effectiveSellerId = sellerId;
            if (!StringUtils.hasText(effectiveSellerId)) {
                User seller = userService.getAllUsers().stream()
                        .filter(u -> "SELLER".equals(u.getRole()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No sellers found"));
                effectiveSellerId = seller.getUserId();
            }

            Property property = new Property();
            property.setTitle(title);
            property.setDescription(description);
            property.setPrice(price);
            property.setLocation(location);
            property.setCategoryId(categoryId);

            return ResponseEntity.ok(propertyService.addProperty(property, effectiveSellerId, imageFile));
        } catch (IOException e) {
            throw new RuntimeException("Error uploading property", e);
        }
    }
}