package com.realEstate.dto;

import java.time.LocalDate;

public class BookingRequest {
    private String propertyId;
    private String message;
    private LocalDate scheduledDate;

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
}
