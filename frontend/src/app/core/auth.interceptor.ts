import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  const cloned = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(cloned).pipe(
    catchError((error: unknown) => {
      const isHttpError = error instanceof HttpErrorResponse;
      if (
        isHttpError &&
        error.status === 401 &&
        token &&
        !request.url.includes('/api/auth/login') &&
        !request.url.includes('/api/auth/register')
      ) {
        authService.logout();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    })
  );
};
