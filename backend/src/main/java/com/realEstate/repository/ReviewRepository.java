package com.realEstate.repository;

import com.realEstate.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByPropertyId(String propertyId);

    List<Review> findByUserId(String userId);
}