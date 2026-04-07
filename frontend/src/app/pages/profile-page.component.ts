import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { UserApiService } from '../core/user-api.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <h1>Profile</h1>
      <p>Update account details and password securely.</p>
    </section>

    <section class="card stack">
      <h2>Account Details</h2>
      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="stack">
        <label>Name</label>
        <input type="text" formControlName="name" />

        <label>Email</label>
        <input type="email" formControlName="email" />

        <label>New Password (optional)</label>
        <input type="password" formControlName="password" />

        <button type="submit" [disabled]="profileForm.invalid">Save Changes</button>
      </form>
    </section>

    <section class="card stack">
      <h2>Change Password</h2>
      <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="stack">
        <label>Current Password</label>
        <input type="password" formControlName="currentPassword" />

        <label>New Password</label>
        <input type="password" formControlName="newPassword" />

        <button type="submit" [disabled]="passwordForm.invalid">Change Password</button>
      </form>
    </section>

    <p class="success" *ngIf="message">{{ message }}</p>
    <p class="error" *ngIf="error">{{ error }}</p>
  `
})
export class ProfilePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  message = '';
  error = '';

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly userApi: UserApiService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userApi.me().subscribe((user) => {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.message = '';
    this.error = '';

    const value = this.profileForm.getRawValue();
    const payload: { name: string; email: string; password?: string } = {
      name: value.name,
      email: value.email
    };

    if (value.password.trim()) {
      payload.password = value.password;
    }

    this.userApi.updateMe(payload).subscribe({
      next: () => {
        this.message = 'Profile updated successfully.';
        this.authService.me().subscribe();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message ?? 'Failed to update profile';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.message = '';
    this.error = '';

    const value = this.passwordForm.getRawValue();
    this.userApi.changePassword(value.currentPassword, value.newPassword).subscribe({
      next: () => {
        this.message = 'Password changed successfully.';
        this.passwordForm.reset({ currentPassword: '', newPassword: '' });
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message ?? 'Failed to change password';
      }
    });
  }
}
