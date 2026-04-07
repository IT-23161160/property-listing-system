import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../core/admin-api.service';
import { AdminUserDetailsPayload } from '../core/models';

@Component({
  selector: 'app-admin-user-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head">
      <h1>User Details</h1>
      <p>Inspect account details and related seller listings.</p>
    </section>

    <section class="card stack" *ngIf="loading">
      <p>Loading user details...</p>
    </section>

    <section class="card stack" *ngIf="error && !loading">
      <p class="error">{{ error }}</p>
      <a class="btn" routerLink="/admin">Back to Admin</a>
    </section>

    <ng-container *ngIf="payload && !loading">
      <section class="card stack">
        <h2>Account</h2>
        <p><strong>ID:</strong> {{ payload.user.userId }}</p>
        <p><strong>Name:</strong> {{ payload.user.name }}</p>
        <p><strong>Email:</strong> {{ payload.user.email }}</p>
        <p><strong>Role:</strong> {{ payload.user.role }}</p>

        <div class="row">
          <a class="btn" routerLink="/admin">Back</a>
          <button (click)="deleteUser(payload.user.userId)">Delete User</button>
        </div>
      </section>

      <section class="card" *ngIf="payload.user.role === 'SELLER'">
        <h2>Seller Properties</h2>
        <table *ngIf="payload.properties.length; else noProperties">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let property of payload.properties">
              <td>{{ property.title }}</td>
              <td>{{ property.location }}</td>
              <td>{{ property.price | currency }}</td>
              <td>{{ property.available ? 'Available' : 'Sold' }}</td>
              <td>
                <a [routerLink]="['/properties', property.propertyId]">View</a>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noProperties>
          <p>No properties listed by this seller.</p>
        </ng-template>
      </section>
    </ng-container>
  `
})
export class AdminUserDetailsPageComponent implements OnInit {
  payload: AdminUserDetailsPayload | null = null;
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminApi: AdminApiService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.error = 'Missing user id';
      this.loading = false;
      return;
    }

    this.adminApi.userDetails(userId).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.loading = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message ?? 'Failed to load user details';
        this.loading = false;
      }
    });
  }

  deleteUser(userId: string): void {
    if (!window.confirm('Delete this user account?')) {
      return;
    }

    this.adminApi.deleteUser(userId).subscribe(() => {
      this.router.navigateByUrl('/admin');
    });
  }
}
