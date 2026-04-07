import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyApiService } from '../core/property-api.service';
import { Property } from '../core/models';

@Component({
  selector: 'app-seller-properties-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head">
      <div>
        <h1>My Properties</h1>
        <p>Manage your listings, update pricing, and mark sold inventory.</p>
      </div>
      <a routerLink="/properties/add" class="btn">Add Listing</a>
    </section>

    <section class="grid" *ngIf="properties.length; else emptyState">
      <article class="card listing" *ngFor="let property of properties">
        <h3>{{ property.title }}</h3>
        <p>{{ property.location }}</p>
        <strong>{{ property.price | currency }}</strong>
        <p class="status" [class.sold]="!property.available">
          {{ property.available ? 'Available' : 'Sold' }}
        </p>
        <div class="row">
          <a [routerLink]="['/properties', property.propertyId]">View</a>
          <a [routerLink]="['/properties', property.propertyId, 'edit']">Edit</a>
          <button (click)="markSold(property.propertyId)">Mark Sold</button>
          <button (click)="delete(property.propertyId)">Delete</button>
        </div>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No listings yet</h3>
        <p>Create your first listing to start receiving booking requests.</p>
      </div>
    </ng-template>
  `
})
export class SellerPropertiesPageComponent implements OnInit {
  properties: Property[] = [];

  constructor(private readonly propertyApi: PropertyApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.propertyApi.getSellerProperties().subscribe((properties) => {
      this.properties = properties;
    });
  }

  markSold(propertyId: string): void {
    this.propertyApi.markSold(propertyId).subscribe(() => this.load());
  }

  delete(propertyId: string): void {
    if (!window.confirm('Delete this listing?')) {
      return;
    }

    this.propertyApi.delete(propertyId).subscribe(() => this.load());
  }
}
