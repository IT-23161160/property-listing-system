package com.realEstate.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String reviewId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String propertyId;

    @Column(nullable = false)
    private int rating;

    @Column(length = 2000)
    private String comment;

    public Review() {
    }

    public Review(String reviewId, String comment, int rating, String propertyId, String userId) {
        this.reviewId = reviewId;
        this.comment = comment;
        this.rating = rating;
        this.propertyId = propertyId;
        this.userId = userId;
    }

    public String getReviewId() {
        return reviewId;
    }

    public void setReviewId(String reviewId) {
        this.reviewId = reviewId;
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

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getReviewID() {
        return reviewId;
    }

    public void setReviewID(String reviewID) {
        this.reviewId = reviewID;
    }

    public String getUserID() {
        return userId;
    }

    public void setUserID(String userID) {
        this.userId = userID;
    }

    public String getPropertyID() {
        return propertyId;
    }

    public void setPropertyID(String propertyID) {
        this.propertyId = propertyID;
    }
}
