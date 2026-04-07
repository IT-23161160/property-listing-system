import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="panel">
        <h1>Create Account</h1>
        <p>Join the property listing platform as a buyer or seller.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
          <label>Full Name</label>
          <input type="text" formControlName="name" placeholder="Jane Doe" />

          <label>Email</label>
          <input type="email" formControlName="email" placeholder="name@example.com" />

          <label>Password</label>
          <input type="password" formControlName="password" placeholder="Create a password" />

          <label>Role</label>
          <select formControlName="role">
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="hint">Already have an account? <a routerLink="/login">Sign in</a></p>
        </form>
      </div>
    </section>
  `
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);

  loading = false;
  error = '';

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['BUYER']
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        const { email, password } = this.form.getRawValue();
        this.authService.login(email, password).subscribe({
          next: ({ user }) => {
            this.loading = false;
            if (user.role === 'SELLER') {
              this.router.navigateByUrl('/seller/properties');
            } else {
              this.router.navigateByUrl('/properties');
            }
          },
          error: () => {
            this.loading = false;
            this.router.navigateByUrl('/login');
          }
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Registration failed';
      }
    });
  }
}
