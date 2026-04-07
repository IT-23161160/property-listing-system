import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/users`;

  constructor(private readonly http: HttpClient) {}

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  updateMe(payload: { name: string; email: string; password?: string }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/me`, payload);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/me/password`, { currentPassword, newPassword }, { responseType: 'text' });
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getSellers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/sellers`);
  }

  delete(userId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${userId}`, { responseType: 'text' });
  }

  updateRole(userId: string, newRole: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}/role`, null, {
      params: { newRole }
    });
  }
}
