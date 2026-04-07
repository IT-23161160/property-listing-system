package com.realEstate.controller;

import com.realEstate.dto.ReviewRequest;
import com.realEstate.model.Review;
import com.realEstate.model.User;
import com.realEstate.service.CurrentUserService;
import com.realEstate.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    @Autowired
    public ReviewController(ReviewService reviewService, CurrentUserService currentUserService) {
        this.reviewService = reviewService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/property/{propertyID}")
    public ResponseEntity<List<Review>> viewReviews(@PathVariable String propertyID) {
        return ResponseEntity.ok(reviewService.getReviewsForProperty(propertyID));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Review>> myReviews() {
        User current = currentUserService.getCurrentUser();
        return ResponseEntity.ok(reviewService.getReviewsByUser(current.getUserId()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<Review> submitReview(@RequestBody ReviewRequest request) {
        User current = currentUserService.getCurrentUser();

        Review review = new Review();
        review.setUserId(current.getUserId());
        review.setPropertyId(request.getPropertyId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return ResponseEntity.ok(reviewService.addReview(review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> editReview(@PathVariable String id, @RequestBody ReviewRequest request) {
        User current = currentUserService.getCurrentUser();
        Review existing = reviewService.getReviewByID(id);
        if (!existing.getUserId().equals(current.getUserId()) && !"ADMIN".equals(current.getRole())) {
            throw new IllegalArgumentException("You are not allowed to edit this review");
        }

        Review update = new Review();
        update.setComment(request.getComment());
        update.setRating(request.getRating());
        return ResponseEntity.ok(reviewService.updateReview(id, update));
    }

    @DeleteMapping("/{reviewID}")
    public ResponseEntity<String> deleteReview(@PathVariable String reviewID) {
        User current = currentUserService.getCurrentUser();
        Review existing = reviewService.getReviewByID(reviewID);
        if (!existing.getUserId().equals(current.getUserId()) && !"ADMIN".equals(current.getRole())) {
            throw new IllegalArgumentException("You are not allowed to delete this review");
        }

        reviewService.deleteReview(reviewID);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
