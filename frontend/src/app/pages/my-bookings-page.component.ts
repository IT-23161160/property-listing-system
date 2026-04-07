import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BookingApiService } from '../core/booking-api.service';
import { Booking } from '../core/models';

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head">
      <h1>My Bookings</h1>
      <p>Review your pending and approved viewing requests.</p>
    </section>

    <section class="grid" *ngIf="bookings.length; else emptyState">
      <article class="card" *ngFor="let booking of bookings">
        <h3>Request {{ booking.requestId }}</h3>
        <p><strong>Property:</strong> {{ booking.propertyId }}</p>
        <p><strong>Date:</strong> {{ booking.scheduledDate }}</p>
        <p><strong>Status:</strong> {{ booking.status }}</p>
        <p>{{ booking.message }}</p>
        <button (click)="deleteBooking(booking.requestId)">Cancel Request</button>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No bookings found</h3>
      </div>
    </ng-template>
  `
})
export class MyBookingsPageComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private readonly bookingApi: BookingApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bookingApi.getMy().subscribe((bookings) => (this.bookings = bookings));
  }

  deleteBooking(requestId: string): void {
    if (!window.confirm('Cancel this booking request?')) {
      return;
    }

    this.bookingApi.delete(requestId).subscribe(() => this.load());
  }
}
