package com.realEstate.controller;

import com.realEstate.dto.FavoriteRequest;
import com.realEstate.model.Favorite;
import com.realEstate.model.Property;
import com.realEstate.model.User;
import com.realEstate.service.CurrentUserService;
import com.realEstate.service.FavoriteService;
import com.realEstate.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final PropertyService propertyService;
    private final FavoriteService favoriteService;
    private final CurrentUserService currentUserService;

    @Autowired
    public FavoriteController(PropertyService propertyService,
                              FavoriteService favoriteService,
                              CurrentUserService currentUserService) {
        this.propertyService = propertyService;
        this.favoriteService = favoriteService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<Map<String, Object>> viewFavorites() {
        User user = currentUserService.getCurrentUser();
        List<Favorite> favorites = favoriteService.getFavoritesByUser(user.getUserId());
        List<Property> properties = new ArrayList<>();
        for (Favorite favorite : favorites) {
            Optional<Property> optionalProperty = propertyService.getPropertyById(favorite.getPropertyId());
            optionalProperty.ifPresent(properties::add);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("favorites", favorites);
        payload.put("properties", properties);
        payload.put("userId", user.getUserId());
        return ResponseEntity.ok(payload);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<Favorite> addFavorite(@RequestBody FavoriteRequest request) {
        User user = currentUserService.getCurrentUser();
        Favorite favorite = favoriteService.addFavorite(
                user.getUserId(),
                request.getPropertyId(),
                request.getStatus() == null ? "ACTIVE" : request.getStatus()
        );
        return ResponseEntity.ok(favorite);
    }

    @PutMapping("/{propertyId}")
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<Favorite> updateFavoriteStatus(@PathVariable String propertyId,
                                                         @RequestBody FavoriteRequest request) {
        User user = currentUserService.getCurrentUser();
        Favorite favorite = favoriteService.updateFavoriteStatus(user.getUserId(), propertyId, request.getStatus());
        return ResponseEntity.ok(favorite);
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<String> deleteFavorite(@PathVariable String propertyId) {
        User user = currentUserService.getCurrentUser();
        favoriteService.removeFavorite(user.getUserId(), propertyId);
        return ResponseEntity.ok("Favorite removed");
    }
}

