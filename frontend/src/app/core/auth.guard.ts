import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export function roleGuard(roles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.isLoggedIn() && authService.hasRole(...roles)
      ? true
      : router.createUrlTree(['/properties']);
  };
}
