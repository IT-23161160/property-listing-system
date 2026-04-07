import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="panel">
        <h1>Welcome Back</h1>
        <p>Sign in to manage your properties, bookings, and favorites.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="name@example.com" />

          <label>Password</label>
          <input type="password" formControlName="password" placeholder="Your password" />

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="hint">No account yet? <a routerLink="/register">Create one</a></p>
        </form>
      </div>
    </section>
  `
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);

  loading = false;
  error = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading = true;
    this.error = '';

    this.authService.login(email, password).subscribe({
      next: ({ user }) => {
        this.loading = false;
        if (user.role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
          return;
        }

        if (user.role === 'SELLER') {
          this.router.navigateByUrl('/seller/properties');
          return;
        }

        this.router.navigateByUrl('/properties');
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Login failed';
      }
    });
  }
}
