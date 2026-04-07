package com.realEstate.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String favoriteId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String propertyId;

    @Column(nullable = false)
    private String status;

    public Favorite() {
    }

    public Favorite(String favoriteId, String userId, String propertyId, String status) {
        this.favoriteId = favoriteId;
        this.userId = userId;
        this.propertyId = propertyId;
        this.status = status;
    }

    public String getFavoriteId() {
        return favoriteId;
    }

    public void setFavoriteId(String favoriteId) {
        this.favoriteId = favoriteId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
