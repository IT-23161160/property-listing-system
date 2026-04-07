import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryApiService } from '../core/category-api.service';
import { Category } from '../core/models';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <h1>Categories</h1>
      <p>Create and maintain property classification tags.</p>
    </section>

    <section class="card stack">
      <form [formGroup]="categoryForm" (ngSubmit)="addCategory()" class="row">
        <input type="text" formControlName="name" placeholder="New category name" />
        <button type="submit" [disabled]="categoryForm.invalid">Add Category</button>
      </form>
    </section>

    <section class="grid" *ngIf="categories.length; else emptyState">
      <article class="card" *ngFor="let category of categories">
        <h3>{{ category.name }}</h3>
        <div class="row">
          <button (click)="rename(category)">Rename</button>
          <button (click)="deleteCategory(category.categoryId)">Delete</button>
        </div>
      </article>
    </section>

    <ng-template #emptyState>
      <div class="card empty">
        <h3>No categories yet</h3>
      </div>
    </ng-template>
  `
})
export class CategoriesPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  categories: Category[] = [];

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required]
  });

  constructor(
    private readonly categoryApi: CategoryApiService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryApi.getAll().subscribe((categories) => (this.categories = categories));
  }

  addCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.categoryApi.add(this.categoryForm.getRawValue().name).subscribe(() => {
      this.categoryForm.reset({ name: '' });
      this.load();
    });
  }

  rename(category: Category): void {
    const name = window.prompt('New category name:', category.name);
    if (!name || !name.trim()) {
      return;
    }

    this.categoryApi.update(category.categoryId, name.trim()).subscribe(() => this.load());
  }

  deleteCategory(categoryId: string): void {
    if (!window.confirm('Delete this category?')) {
      return;
    }

    this.categoryApi.delete(categoryId).subscribe(() => this.load());
  }
}
