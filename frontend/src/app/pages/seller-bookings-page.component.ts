import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingApiService } from '../core/booking-api.service';
import { Booking } from '../core/models';

@Component({
  selector: 'app-seller-bookings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head">
      <h1>Seller Bookings</h1>
      <p>Approve, reject, or monitor booking requests for your listings.</p>
    </section>

    <section class="grid" *ngIf="bookings.length; else emptyState">
      <article class="card" *ngFor="let booking of bookings">
        <h3>Request {{ booking.requestId }}</h3>
        <p><strong>Property:</strong> {{ booking.propertyId }}</p>
        <p><strong>Buyer:</strong> {{ booking.buyerId }}</p>
        <p><strong>Date:</strong> {{ booking.scheduledDate }}</p>
        <p>{{ booking.message }}</p>

        <label>Status</label>
        <select [(ngModel)]="booking.status">
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>

        <div class="row">
          <button (click)="updateStatus(booking)">Save Status</button>
          <button (click)="deleteBooking(booking.requestId)">Delete</button>
        </div>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No seller bookings found</h3>
      </div>
    </ng-template>
  `
})
export class SellerBookingsPageComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private readonly bookingApi: BookingApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bookingApi.getSeller().subscribe((bookings) => (this.bookings = bookings));
  }

  updateStatus(booking: Booking): void {
    this.bookingApi.updateStatus(booking.requestId, booking.status).subscribe(() => this.load());
  }

  deleteBooking(requestId: string): void {
    if (!window.confirm('Delete this booking?')) {
      return;
    }

    this.bookingApi.delete(requestId).subscribe(() => this.load());
  }
}
