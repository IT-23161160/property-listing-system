import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryApiService } from '../core/category-api.service';
import { PropertyApiService } from '../core/property-api.service';
import { AuthService } from '../core/auth.service';
import { Category, User } from '../core/models';
import { UserApiService } from '../core/user-api.service';

@Component({
  selector: 'app-property-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <h1>{{ editingId ? 'Edit Property' : 'Add Property' }}</h1>
      <p>Manage listing details and images with a single form.</p>
    </section>

    <form class="card stack" [formGroup]="form" (ngSubmit)="submit()">
      <label>Title</label>
      <input type="text" formControlName="title" />

      <label>Description</label>
      <textarea rows="4" formControlName="description"></textarea>

      <label>Price</label>
      <input type="number" formControlName="price" />

      <label>Location</label>
      <input type="text" formControlName="location" />

      <label>Category</label>
      <select formControlName="categoryId">
        <option *ngFor="let category of categories" [value]="category.categoryId">{{ category.name }}</option>
      </select>

      <label *ngIf="isAdmin">Assign Seller</label>
      <select *ngIf="isAdmin" formControlName="sellerId">
        <option value="">Auto Assign</option>
        <option *ngFor="let seller of sellers" [value]="seller.userId">{{ seller.name }} ({{ seller.email }})</option>
      </select>

      <label>
        <input type="checkbox" formControlName="available" />
        Available
      </label>

      <label>Image</label>
      <input type="file" (change)="onFileSelected($event)" accept="image/*" />

      <button type="submit" [disabled]="form.invalid || loading">
        {{ loading ? 'Saving...' : editingId ? 'Update Property' : 'Create Property' }}
      </button>

      <p class="error" *ngIf="error">{{ error }}</p>
    </form>
  `
})
export class PropertyFormPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  loading = false;
  error = '';
  editingId: string | null = null;
  selectedFile: File | null = null;
  categories: Category[] = [];
  sellers: User[] = [];

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    price: [1000, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    categoryId: ['', Validators.required],
    available: [true],
    sellerId: ['']
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly propertyApi: PropertyApiService,
    private readonly categoryApi: CategoryApiService,
    private readonly authService: AuthService,
    private readonly userApi: UserApiService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.editingId = this.route.snapshot.paramMap.get('id');

    this.categoryApi.getAll().subscribe((categories) => {
      this.categories = categories;
      if (!this.form.value.categoryId && categories.length > 0) {
        this.form.patchValue({ categoryId: categories[0].categoryId });
      }
    });

    if (this.isAdmin) {
      this.userApi.getSellers().subscribe((sellers) => (this.sellers = sellers));
    }

    if (this.editingId) {
      this.propertyApi.getById(this.editingId).subscribe((payload) => {
        const property = payload.property;
        this.form.patchValue({
          title: property.title,
          description: property.description,
          price: property.price,
          location: property.location,
          categoryId: property.categoryId ?? '',
          available: property.available,
          sellerId: property.sellerId
        });
      });
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = new FormData();
    const value = this.form.getRawValue();
    formData.append('title', value.title);
    formData.append('description', value.description);
    formData.append('price', String(value.price));
    formData.append('location', value.location);
    formData.append('categoryId', value.categoryId);
    formData.append('available', String(value.available));

    if (this.isAdmin && value.sellerId) {
      formData.append('sellerId', value.sellerId);
    }

    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    const request$ = this.editingId
      ? this.propertyApi.update(this.editingId, formData)
      : this.propertyApi.add(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        if (this.authService.hasRole('ADMIN')) {
          this.router.navigateByUrl('/admin');
        } else if (this.authService.hasRole('SELLER')) {
          this.router.navigateByUrl('/seller/properties');
        } else {
          this.router.navigateByUrl('/properties');
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Failed to save property';
      }
    });
  }
}
