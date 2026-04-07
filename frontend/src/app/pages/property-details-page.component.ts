import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { BookingApiService } from '../core/booking-api.service';
import { FavoriteApiService } from '../core/favorite-api.service';
import { PropertyApiService } from '../core/property-api.service';
import { ReviewApiService } from '../core/review-api.service';
import { PropertyDetailPayload, Review } from '../core/models';

@Component({
  selector: 'app-property-details-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section *ngIf="payload as data; else loadingTpl" class="details-wrap">
      <article class="card hero">
        <img [src]="imageUrl(data.property.imagePath)" [alt]="data.property.title" (error)="fallbackImage($event)" />
        <div>
          <h1>{{ data.property.title }}</h1>
          <p>{{ data.property.description }}</p>
          <p><strong>Location:</strong> {{ data.property.location }}</p>
          <p><strong>Category:</strong> {{ data.categoryName }}</p>
          <p><strong>Seller:</strong> {{ data.seller.name }} ({{ data.seller.email }})</p>
          <p class="price">{{ data.property.price | currency }}</p>
          <p class="status" [class.sold]="!data.property.available">{{ data.property.available ? 'Available' : 'Sold' }}</p>
          <div class="row">
            <button *ngIf="isBuyer" (click)="toggleFavorite()">
              {{ data.isBookmarked ? 'Remove Favorite' : 'Add Favorite' }}
            </button>
            <button *ngIf="canEditProperty" (click)="editProperty()">Edit</button>
          </div>
        </div>
      </article>

      <section class="card" *ngIf="isBuyer && data.property.available">
        <h2>Book Viewing</h2>
        <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="stack">
          <label>Message</label>
          <textarea rows="3" formControlName="message"></textarea>
          <label>Preferred Date</label>
          <input type="date" formControlName="scheduledDate" />
          <button type="submit" [disabled]="bookingForm.invalid">Submit Booking</button>
        </form>
      </section>

      <section class="card">
        <h2>Reviews</h2>
        <div class="review" *ngFor="let review of data.reviews">
          <p><strong>Rating:</strong> {{ review.rating }}/5</p>
          <p>{{ review.comment }}</p>
          <div class="row" *ngIf="canModifyReview(review)">
            <button (click)="editReview(review)">Edit</button>
            <button (click)="deleteReview(review.reviewId)">Delete</button>
          </div>
        </div>

        <form *ngIf="isBuyer && data.canReview" [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="stack">
          <label>Rating</label>
          <input type="number" min="1" max="5" formControlName="rating" />
          <label>Comment</label>
          <textarea rows="3" formControlName="comment"></textarea>
          <button type="submit" [disabled]="reviewForm.invalid">Add Review</button>
        </form>
      </section>
    </section>

    <section class="card" *ngIf="error && !loading">
      <p class="error">{{ error }}</p>
      <button (click)="load()">Retry</button>
    </section>

    <ng-template #loadingTpl>
      <div class="card empty">
        <h3>{{ loading ? 'Loading property details...' : 'Unable to load property.' }}</h3>
      </div>
    </ng-template>
  `
})
export class PropertyDetailsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  propertyId = '';
  payload: PropertyDetailPayload | null = null;
  loading = true;
  error = '';

  readonly reviewForm = this.formBuilder.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(2)]]
  });

  readonly bookingForm = this.formBuilder.nonNullable.group({
    message: ['', [Validators.required]],
    scheduledDate: ['', [Validators.required]]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly propertyApi: PropertyApiService,
    private readonly reviewApi: ReviewApiService,
    private readonly bookingApi: BookingApiService,
    private readonly favoriteApi: FavoriteApiService,
    private readonly authService: AuthService
  ) {}

  get isBuyer(): boolean {
    return this.authService.hasRole('BUYER');
  }

  get canEditProperty(): boolean {
    const user = this.authService.currentUser;
    if (!user || !this.payload) {
      return false;
    }

    return user.role === 'ADMIN' || (user.role === 'SELLER' && user.userId === this.payload.property.sellerId);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/properties');
      return;
    }

    this.propertyId = id;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.propertyApi.getById(this.propertyId).subscribe({
      next: (payload) => {
        this.payload = payload;
        this.loading = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.payload = null;
        this.loading = false;
        this.error = err.error?.message ?? 'Failed to load property details.';
      }
    });
  }

  toggleFavorite(): void {
    if (!this.payload || !this.isBuyer) {
      return;
    }

    if (this.payload.isBookmarked) {
      this.favoriteApi.remove(this.propertyId).subscribe(() => this.load());
      return;
    }

    this.favoriteApi.add(this.propertyId).subscribe(() => this.load());
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.payload) {
      return;
    }

    const value = this.reviewForm.getRawValue();
    this.reviewApi
      .add({ propertyId: this.propertyId, rating: value.rating, comment: value.comment })
      .subscribe(() => {
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.load();
      });
  }

  editReview(review: Review): void {
    const newRating = Number(window.prompt('New rating (1-5):', String(review.rating)));
    const newComment = window.prompt('New comment:', review.comment) ?? review.comment;
    if (!newRating || newRating < 1 || newRating > 5) {
      return;
    }

    this.reviewApi
      .update(review.reviewId, { rating: newRating, comment: newComment })
      .subscribe(() => this.load());
  }

  deleteReview(reviewId: string): void {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    this.reviewApi.delete(reviewId).subscribe(() => this.load());
  }

  canModifyReview(review: Review): boolean {
    const user = this.authService.currentUser;
    if (!user || !this.payload) {
      return false;
    }

    return review.userId === this.payload.sessionUserId || user.role === 'ADMIN';
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    const value = this.bookingForm.getRawValue();
    this.bookingApi
      .create({
        propertyId: this.propertyId,
        message: value.message,
        scheduledDate: value.scheduledDate
      })
      .subscribe(() => {
        this.bookingForm.reset({ message: '', scheduledDate: '' });
        this.router.navigateByUrl('/bookings/my');
      });
  }

  editProperty(): void {
    this.router.navigate(['/properties', this.propertyId, 'edit']);
  }

  imageUrl(path?: string): string {
    if (!path) {
      return 'assets/legacy/images/background.jpg';
    }

    return `/uploads/properties/${path}`;
  }

  fallbackImage(event: Event): void {
    const target = event.target as HTMLImageElement;
    const fallbackPath = 'assets/legacy/images/background.jpg';
    if (!target.src.includes(fallbackPath)) {
      target.src = fallbackPath;
    }
  }
}
