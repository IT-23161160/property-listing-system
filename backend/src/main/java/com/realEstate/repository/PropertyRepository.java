package com.realEstate.repository;

import com.realEstate.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, String> {
    List<Property> findBySellerId(String sellerId);
}
