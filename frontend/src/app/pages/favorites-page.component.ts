import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteApiService } from '../core/favorite-api.service';
import { FavoritesPayload } from '../core/models';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head">
      <h1>My Favorites</h1>
      <p>Track saved properties and jump straight to details.</p>
    </section>

    <section class="grid" *ngIf="payload?.properties?.length; else emptyState">
      <article class="card listing" *ngFor="let property of payload?.properties">
        <h3>{{ property.title }}</h3>
        <p>{{ property.location }}</p>
        <strong>{{ property.price | currency }}</strong>
        <div class="row">
          <a [routerLink]="['/properties', property.propertyId]">View</a>
          <button (click)="remove(property.propertyId)">Remove</button>
        </div>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No favorites yet</h3>
        <p>Bookmark properties from the details page.</p>
      </div>
    </ng-template>
  `
})
export class FavoritesPageComponent implements OnInit {
  payload: FavoritesPayload | null = null;

  constructor(private readonly favoriteApi: FavoriteApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.favoriteApi.getMine().subscribe((payload) => (this.payload = payload));
  }

  remove(propertyId: string): void {
    this.favoriteApi.remove(propertyId).subscribe(() => this.load());
  }
}
