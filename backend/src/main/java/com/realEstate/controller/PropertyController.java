package com.realEstate.controller;

import com.realEstate.model.Property;
import com.realEstate.model.Review;
import com.realEstate.model.User;
import com.realEstate.model.Category;
import com.realEstate.service.*;
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

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;

    @Autowired
    private UserService userService;
    @Autowired
    private ReviewService reviewService;
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/sorted-by-price")
    public ResponseEntity<List<Property>> getPropertiesSortedByPrice() {
        return ResponseEntity.ok(propertyService.getPropertiesSortedByPrice());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPropertyById(@PathVariable String id) {
        Property property = propertyService.getPropertyById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User seller = userService.getUserById(property.getSellerId());
        List<Review> reviews = reviewService.getReviewsForProperty(id);
        User currentUser = currentUserService.getCurrentUser();
        boolean isBookmarked = favoriteService.isFavorite(currentUser.getUserId(), id);

        String categoryName = "Uncategorized";
        if (property.getCategoryId() != null) {
            categoryName = categoryService.getCategoryById(property.getCategoryId())
                    .map(Category::getName)
                    .orElse("Uncategorized");
        }

        boolean canReview = reviews.stream().noneMatch(r -> r.getUserId().equals(currentUser.getUserId()));

        Map<String, Object> payload = new HashMap<>();
        payload.put("property", enrichProperty(property));
        payload.put("seller", Map.of(
                "userId", seller.getUserId(),
                "name", seller.getName(),
                "email", seller.getEmail()
        ));
        payload.put("reviews", reviews);
        payload.put("categoryName", categoryName);
        payload.put("isBookmarked", isBookmarked);
        payload.put("canReview", canReview);
        payload.put("sessionUserId", currentUser.getUserId());

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/seller/me")
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN')")
    public ResponseEntity<List<Property>> getPropertiesForCurrentSeller() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(propertyService.getPropertiesBySeller(user.getUserId()));
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Property>> getPropertiesBySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(propertyService.getPropertiesBySeller(sellerId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN')")
    public ResponseEntity<Property> addProperty(@RequestParam String title,
                                                @RequestParam String description,
                                                @RequestParam double price,
                                                @RequestParam String location,
                                                @RequestParam String categoryId,
                                                @RequestParam(value = "sellerId", required = false) String sellerId,
                                                @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        User current = currentUserService.getCurrentUser();

        String effectiveSellerId = current.getUserId();
        if ("ADMIN".equalsIgnoreCase(current.getRole()) && StringUtils.hasText(sellerId)) {
            effectiveSellerId = sellerId;
        }

        Property property = new Property();
        property.setTitle(title);
        property.setDescription(description);
        property.setPrice(price);
        property.setLocation(location);
        property.setCategoryId(categoryId);

        try {
            Property created = propertyService.addProperty(property, effectiveSellerId, imageFile);
            return ResponseEntity.ok(created);
        } catch (IOException e) {
            throw new RuntimeException("Failed to add property", e);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN')")
    public ResponseEntity<Property> updateProperty(@PathVariable String id,
                                                   @RequestParam String title,
                                                   @RequestParam String description,
                                                   @RequestParam double price,
                                                   @RequestParam String location,
                                                   @RequestParam String categoryId,
                                                   @RequestParam(defaultValue = "true") boolean available,
                                                   @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        Property property = new Property();
        property.setTitle(title);
        property.setDescription(description);
        property.setPrice(price);
        property.setLocation(location);
        property.setCategoryId(categoryId);
        property.setAvailable(available);

        try {
            return ResponseEntity.ok(propertyService.updateProperty(id, property, imageFile));
        } catch (IOException e) {
            throw new RuntimeException("Failed to update property", e);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN')")
    public ResponseEntity<String> deleteProperty(@PathVariable String id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok("Property deleted successfully");
    }

    @PutMapping("/{id}/mark-sold")
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN')")
    public ResponseEntity<Property> markPropertyAsSold(@PathVariable String id) {
        return ResponseEntity.ok(propertyService.markPropertyAsSold(id));
    }

    @GetMapping("/search/price")
    public ResponseEntity<List<Property>> searchByPriceRange(@RequestParam double minPrice,
                                                             @RequestParam double maxPrice) {
        return ResponseEntity.ok(propertyService.searchPropertiesByPriceRange(minPrice, maxPrice));
    }

    private Map<String, Object> enrichProperty(Property property) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("propertyId", property.getPropertyId());
        payload.put("title", property.getTitle());
        payload.put("description", property.getDescription());
        payload.put("price", property.getPrice());
        payload.put("location", property.getLocation());
        payload.put("sellerId", property.getSellerId());
        payload.put("available", property.isAvailable());
        payload.put("imagePath", property.getImagePath());
        payload.put("imageUrl", property.getImagePath() == null || property.getImagePath().isBlank()
                ? null
                : "/uploads/properties/" + property.getImagePath());
        payload.put("categoryId", property.getCategoryId());
        return payload;
    }
}