package com.realEstate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String propertyId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @Column(nullable = false)
    private double price;
    
    private String location;
    
    @Column(nullable = false)
    private String sellerId;
    
    @Column(nullable = false)
    private boolean available;
    
    private String imagePath;
    
    private String categoryId;

    public Property() {
    }

    public Property(String propertyId, String title, String description, double price, String location, String sellerId, boolean available, String imagePath, String categoryId) {
        this.propertyId = propertyId;
        this.title = title;
        this.description = description;
        this.price = price;
        this.location = location;
        this.sellerId = sellerId;
        this.available = available;
        this.imagePath = imagePath;
        this.categoryId = categoryId;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }
}
