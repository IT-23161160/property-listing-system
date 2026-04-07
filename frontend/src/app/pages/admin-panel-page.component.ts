import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../core/admin-api.service';
import { CategoryApiService } from '../core/category-api.service';
import { UserApiService } from '../core/user-api.service';
import { AdminBookingsPayload, AdminUsersPayload, Category, Property, User } from '../core/models';

@Component({
  selector: 'app-admin-panel-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-head">
      <h1>Admin Control Center</h1>
      <p>Manage users, properties, bookings, and catalog data from one panel.</p>
    </section>

    <section class="card stack">
      <h2>Add Property As Admin</h2>
      <form [formGroup]="propertyForm" (ngSubmit)="addProperty()" class="stack">
        <input type="text" formControlName="title" placeholder="Title" />
        <textarea rows="3" formControlName="description" placeholder="Description"></textarea>
        <input type="number" formControlName="price" placeholder="Price" />
        <input type="text" formControlName="location" placeholder="Location" />

        <select formControlName="categoryId">
          <option *ngFor="let category of categories" [value]="category.categoryId">{{ category.name }}</option>
        </select>

        <select formControlName="sellerId">
          <option value="">Auto Assign Seller</option>
          <option *ngFor="let seller of sellers" [value]="seller.userId">{{ seller.name }} ({{ seller.email }})</option>
        </select>

        <input type="file" (change)="onFileSelected($event)" accept="image/*" />
        <button type="submit" [disabled]="propertyForm.invalid">Create Property</button>
      </form>
    </section>

    <section class="card">
      <h2>Users</h2>
      <table *ngIf="usersPayload as usersData">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Listings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of usersData.users">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ usersData.propertyCounts[user.userId] || 0 }}</td>
            <td>
              <a [routerLink]="['/admin/users', user.userId]">View</a>
              <button (click)="deleteUser(user.userId)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Properties</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let property of properties">
            <td>{{ property.title }}</td>
            <td>{{ property.price | currency }}</td>
            <td>{{ property.available ? 'Available' : 'Sold' }}</td>
            <td>
              <button (click)="markSold(property.propertyId)">Mark Sold</button>
              <button (click)="deleteProperty(property.propertyId)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Bookings</h2>
      <div class="row" style="margin-bottom: 1rem;">
        <button (click)="setBookingFilter('ALL')">All</button>
        <button (click)="setBookingFilter('Pending')">Pending</button>
        <button (click)="setBookingFilter('Confirmed')">Confirmed</button>
        <button (click)="setBookingFilter('Cancelled')">Cancelled</button>
        <button (click)="setBookingFilter('Completed')">Completed</button>
      </div>
      <table *ngIf="bookingsPayload as bookingsData">
        <thead>
          <tr>
            <th>Request</th>
            <th>Property</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let booking of filteredBookings()">
            <td>{{ booking.requestId }}</td>
            <td>{{ bookingsData.propertyTitles[booking.propertyId] || booking.propertyId }}</td>
            <td>{{ bookingsData.buyerNames[booking.buyerId] || booking.buyerId }}</td>
            <td>{{ bookingsData.sellerNames[booking.propertyId] || 'N/A' }}</td>
            <td>{{ booking.status }}</td>
            <td>
              <select #statusSel [value]="booking.status">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
              <button (click)="updateBookingStatus(booking.requestId, statusSel.value)">Save</button>
              <button (click)="deleteBooking(booking.requestId)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class AdminPanelPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  usersPayload: AdminUsersPayload | null = null;
  bookingsPayload: AdminBookingsPayload | null = null;
  properties: Property[] = [];
  categories: Category[] = [];
  sellers: User[] = [];
  selectedFile: File | null = null;
  bookingStatusFilter: 'ALL' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' = 'ALL';

  readonly propertyForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    price: [1000, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    categoryId: ['', Validators.required],
    sellerId: ['']
  });

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly userApi: UserApiService,
    private readonly categoryApi: CategoryApiService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.adminApi.users().subscribe((payload) => {
      this.usersPayload = payload;
    });

    this.adminApi.bookings().subscribe((payload) => {
      this.bookingsPayload = payload;
    });

    this.adminApi.properties().subscribe((properties) => {
      this.properties = properties;
    });

    this.categoryApi.getAll().subscribe((categories) => {
      this.categories = categories;
      if (!this.propertyForm.value.categoryId && categories.length > 0) {
        this.propertyForm.patchValue({ categoryId: categories[0].categoryId });
      }
    });

    this.userApi.getSellers().subscribe((sellers) => {
      this.sellers = sellers;
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
  }

  addProperty(): void {
    if (this.propertyForm.invalid) {
      return;
    }

    const formData = new FormData();
    const value = this.propertyForm.getRawValue();
    formData.append('title', value.title);
    formData.append('description', value.description);
    formData.append('price', String(value.price));
    formData.append('location', value.location);
    formData.append('categoryId', value.categoryId);

    if (value.sellerId) {
      formData.append('sellerId', value.sellerId);
    }

    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    this.adminApi.addProperty(formData).subscribe(() => {
      this.propertyForm.reset({
        title: '',
        description: '',
        price: 1000,
        location: '',
        categoryId: this.categories[0]?.categoryId ?? '',
        sellerId: ''
      });
      this.selectedFile = null;
      this.loadAll();
    });
  }

  deleteUser(userId: string): void {
    if (!window.confirm('Delete this user account?')) {
      return;
    }

    this.adminApi.deleteUser(userId).subscribe(() => this.loadAll());
  }

  deleteProperty(propertyId: string): void {
    if (!window.confirm('Delete this property?')) {
      return;
    }

    this.adminApi.deleteProperty(propertyId).subscribe(() => this.loadAll());
  }

  markSold(propertyId: string): void {
    this.adminApi.markPropertySold(propertyId).subscribe(() => this.loadAll());
  }

  updateBookingStatus(requestId: string, status: string): void {
    this.adminApi.updateBookingStatus(requestId, status).subscribe(() => this.loadAll());
  }

  setBookingFilter(status: 'ALL' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'): void {
    this.bookingStatusFilter = status;
  }

  filteredBookings() {
    const bookings = this.bookingsPayload?.bookings ?? [];
    if (this.bookingStatusFilter === 'ALL') {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === this.bookingStatusFilter);
  }

  deleteBooking(requestId: string): void {
    if (!window.confirm('Delete this booking?')) {
      return;
    }

    this.adminApi.deleteBooking(requestId).subscribe(() => this.loadAll());
  }
}
