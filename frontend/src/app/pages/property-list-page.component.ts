import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PropertyApiService } from '../core/property-api.service';
import { Property } from '../core/models';

@Component({
  selector: 'app-property-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <section class="page-head">
      <div>
        <h1>Properties</h1>
        <p>Discover listings with fast sorting powered by the BST service.</p>
      </div>
      <div class="actions" *ngIf="canManageProperties">
        <a routerLink="/properties/add" class="btn">Add Property</a>
      </div>
    </section>

    <section class="toolbar card">
      <button (click)="loadAll()">All</button>
      <button (click)="loadSorted()">Sort by Price</button>
      <div class="search-range">
        <input type="number" [(ngModel)]="minPrice" placeholder="Min" />
        <input type="number" [(ngModel)]="maxPrice" placeholder="Max" />
        <button (click)="searchByPrice()">Search</button>
      </div>
    </section>

    <section class="card" *ngIf="loading">
      <p>Loading properties...</p>
    </section>

    <section class="card" *ngIf="error && !loading">
      <p class="error">{{ error }}</p>
      <button (click)="loadAll()">Retry</button>
    </section>

    <section class="grid" *ngIf="!loading && !error && properties.length; else emptyState">
      <article class="card listing" *ngFor="let property of properties">
        <img
          [src]="imageUrl(property)"
          [alt]="property.title"
          (error)="fallbackImage($event)"
        />
        <div class="content">
          <h3>{{ property.title }}</h3>
          <p>{{ property.location }}</p>
          <strong>{{ property.price | currency }}</strong>
          <p class="status" [class.sold]="!property.available">
            {{ property.available ? 'Available' : 'Sold' }}
          </p>
          <div class="row">
            <a [routerLink]="['/properties', property.propertyId]">View Details</a>
            <a *ngIf="canEdit(property)" [routerLink]="['/properties', property.propertyId, 'edit']">Edit</a>
            <button *ngIf="canEdit(property)" (click)="markSold(property.propertyId)">Mark Sold</button>
            <button *ngIf="canEdit(property)" (click)="remove(property.propertyId)">Delete</button>
          </div>
        </div>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No properties found</h3>
        <p>Try changing filters or add a new listing.</p>
      </div>
    </ng-template>
  `
})
export class PropertyListPageComponent implements OnInit {
  properties: Property[] = [];
  minPrice = 0;
  maxPrice = 1000000;
  loading = true;
  error = '';

  constructor(
    private readonly propertyApi: PropertyApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get canManageProperties(): boolean {
    return this.authService.hasRole('SELLER', 'ADMIN');
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.runListRequest(this.propertyApi.getAll());
  }

  loadSorted(): void {
    this.runListRequest(this.propertyApi.getSortedByPrice());
  }

  searchByPrice(): void {
    this.runListRequest(this.propertyApi.searchByPrice(this.minPrice, this.maxPrice));
  }

  canEdit(property: Property): boolean {
    const user = this.authService.currentUser;
    if (!user) {
      return false;
    }

    return user.role === 'ADMIN' || (user.role === 'SELLER' && user.userId === property.sellerId);
  }

  markSold(propertyId: string): void {
    this.propertyApi.markSold(propertyId).subscribe(() => this.loadAll());
  }

  remove(propertyId: string): void {
    if (!window.confirm('Delete this property?')) {
      return;
    }

    this.propertyApi.delete(propertyId).subscribe(() => this.loadAll());
  }

  imageUrl(property: Property): string {
    if (property.imagePath) {
      return `/uploads/properties/${property.imagePath}`;
    }
    return 'assets/legacy/images/background.jpg';
  }

  fallbackImage(event: Event): void {
    const target = event.target as HTMLImageElement;
    const fallbackPath = 'assets/legacy/images/background.jpg';
    if (!target.src.includes(fallbackPath)) {
      target.src = fallbackPath;
    }
  }

  openSellerView(): void {
    this.router.navigateByUrl('/seller/properties');
  }

  private runListRequest(request$: Observable<Property[]>): void {
    this.loading = true;
    this.error = '';

    request$.subscribe({
      next: (items) => {
        this.properties = items;
        this.loading = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.properties = [];
        this.error = err.error?.message ?? 'Failed to load properties. Please try again.';
      }
    });
  }
}
