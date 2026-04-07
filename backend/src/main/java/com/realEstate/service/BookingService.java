package com.realEstate.service;

import com.realEstate.model.Booking;
import com.realEstate.model.Property;
import com.realEstate.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyService propertyService;

    @Autowired
    public BookingService(BookingRepository bookingRepository, PropertyService propertyService) {
        this.bookingRepository = bookingRepository;
        this.propertyService = propertyService;
    }

    public void saveBooking(Booking booking) {
        booking.setStatus("Pending");
        bookingRepository.save(booking);
    }

    public void updateBooking(Booking updatedBooking) {
        Booking existingBooking = getBookingById(updatedBooking.getRequestId());
        existingBooking.setStatus(updatedBooking.getStatus());
        existingBooking.setMessage(updatedBooking.getMessage());
        existingBooking.setScheduledDate(updatedBooking.getScheduledDate());
        bookingRepository.save(existingBooking);
    }

    public void deleteBooking(String requestId) {
        bookingRepository.deleteById(requestId);
    }

    public Booking getBookingById(String requestId) {
        return bookingRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + requestId));
    }

    public List<Booking> getBookingsByBuyer(String buyerId) {
        return bookingRepository.findByBuyerId(buyerId);
    }

    public List<Booking> getBookingsForSeller(String sellerId) {
        List<Property> sellerProperties = propertyService.getPropertiesBySeller(sellerId);
        Set<String> propertyIds = sellerProperties.stream()
                .map(Property::getPropertyId)
                .collect(Collectors.toSet());

        if (propertyIds.isEmpty()) {
            return List.of();
        }

        return bookingRepository.findByPropertyIdIn(propertyIds.stream().toList());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public void updateBookingStatus(String requestId, String status) {
        Booking booking = getBookingById(requestId);
        booking.setStatus(status);
        bookingRepository.save(booking);
    }
}



