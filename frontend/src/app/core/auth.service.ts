import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './config';
import { AuthResponse, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'pls_token';
  private readonly userKey = 'pls_user';
  private readonly baseUrl = `${API_BASE_URL}/api/auth`;

  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  hasRole(...roles: string[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  register(payload: { name: string; email: string; password: string; role: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, payload);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
