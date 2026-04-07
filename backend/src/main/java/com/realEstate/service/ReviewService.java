package com.realEstate.service;

import com.realEstate.model.Review;
import com.realEstate.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsForProperty(String propertyId) {
        return reviewRepository.findByPropertyId(propertyId);
    }

    public List<Review> getReviewsByUser(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review getReviewByID(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
    }

    public Review addReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating should be between 1 and 5");
        }
        return reviewRepository.save(review);
    }

    public Review updateReview(String reviewId, Review updatedReview) {
        Review existing = getReviewByID(reviewId);
        existing.setComment(updatedReview.getComment());
        existing.setRating(updatedReview.getRating());
        return reviewRepository.save(existing);
    }

    public void deleteReview(String reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
