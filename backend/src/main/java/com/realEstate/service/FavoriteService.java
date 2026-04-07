package com.realEstate.service;

import com.realEstate.model.Favorite;
import com.realEstate.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FavoriteService {
    private final FavoriteRepository repository;

    @Autowired
    public FavoriteService(FavoriteRepository repository) {
        this.repository = repository;
    }

    public Favorite addFavorite(String userId, String propertyId, String status) {
        return repository.findByUserIdAndPropertyId(userId, propertyId)
                .map(existing -> {
                    existing.setStatus(status);
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(new Favorite(null, userId, propertyId, status)));
    }

    public List<Favorite> getFavoritesByUser(String userId) {
        return repository.findByUserId(userId);
    }

    public Favorite updateFavoriteStatus(String userId, String propertyId, String status) {
        Favorite favorite = repository.findByUserIdAndPropertyId(userId, propertyId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        favorite.setStatus(status);
        return repository.save(favorite);
    }

    public void removeFavorite(String userId, String propertyId) {
        repository.deleteByUserIdAndPropertyId(userId, propertyId);
    }

    public boolean isFavorite(String userId, String propertyId) {
        return repository.findByUserIdAndPropertyId(userId, propertyId).isPresent();
    }
}

