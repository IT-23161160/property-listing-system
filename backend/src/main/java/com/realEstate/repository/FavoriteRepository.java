package com.realEstate.repository;

import com.realEstate.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId);

    Optional<Favorite> findByUserIdAndPropertyId(String userId, String propertyId);

    @Transactional
    void deleteByUserIdAndPropertyId(String userId, String propertyId);
}

