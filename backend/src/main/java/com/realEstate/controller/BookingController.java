package com.realEstate.controller;

import com.realEstate.dto.BookingRequest;
import com.realEstate.dto.BookingStatusRequest;
import com.realEstate.model.Booking;
import com.realEstate.model.User;
import com.realEstate.service.BookingService;
import com.realEstate.service.CurrentUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @Autowired
    public BookingController(BookingService bookingService, CurrentUserService currentUserService) {
        this.bookingService = bookingService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        User user = currentUserService.getCurrentUser();
        Booking booking = new Booking();
        booking.setBuyerId(user.getUserId());
        booking.setPropertyId(request.getPropertyId());
        booking.setMessage(request.getMessage());
        booking.setScheduledDate(request.getScheduledDate());
        bookingService.saveBooking(booking);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable("id") String requestId) {
        return ResponseEntity.ok(bookingService.getBookingById(requestId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable("id") String requestId,
                                                 @RequestBody BookingStatusRequest request) {
        Booking existingBooking = bookingService.getBookingById(requestId);
        existingBooking.setStatus(request.getStatus());
        bookingService.updateBooking(existingBooking);
        return ResponseEntity.ok(existingBooking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable("id") String requestId) {
        bookingService.deleteBooking(requestId);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('BUYER')")
    public ResponseEntity<List<Booking>> viewMyBookings() {
        String userId = currentUserService.getCurrentUser().getUserId();
        List<Booking> bookings = bookingService.getBookingsByBuyer(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAuthority('SELLER')")
    public ResponseEntity<List<Booking>> viewSellerBookings() {
        String sellerId = currentUserService.getCurrentUser().getUserId();
        List<Booking> bookings = bookingService.getBookingsForSeller(sellerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Booking>> viewAllBookingsForAdmin() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}


