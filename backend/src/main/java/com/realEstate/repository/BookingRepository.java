package com.realEstate.repository;

import com.realEstate.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByBuyerId(String buyerId);

    List<Booking> findByPropertyIdIn(List<String> propertyIds);
}

