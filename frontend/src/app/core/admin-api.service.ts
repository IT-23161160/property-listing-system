import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { AdminBookingsPayload, AdminUserDetailsPayload, AdminUsersPayload, Property } from './models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/admin`;

  constructor(private readonly http: HttpClient) {}

  users(): Observable<AdminUsersPayload> {
    return this.http.get<AdminUsersPayload>(`${this.baseUrl}/users`);
  }

  userDetails(userId: string): Observable<AdminUserDetailsPayload> {
    return this.http.get<AdminUserDetailsPayload>(`${this.baseUrl}/users/${userId}`);
  }

  properties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/properties`);
  }

  bookings(): Observable<AdminBookingsPayload> {
    return this.http.get<AdminBookingsPayload>(`${this.baseUrl}/bookings`);
  }

  updateBookingStatus(requestId: string, status: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/bookings/${requestId}/status`, { status }, { responseType: 'text' });
  }

  deleteBooking(requestId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/bookings/${requestId}`, { responseType: 'text' });
  }

  deleteProperty(propertyId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/properties/${propertyId}`, { responseType: 'text' });
  }

  deleteUser(userId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`, { responseType: 'text' });
  }

  markPropertySold(propertyId: string): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/properties/${propertyId}/mark-sold`, {});
  }

  addProperty(formData: FormData): Observable<Property> {
    return this.http.post<Property>(`${this.baseUrl}/properties`, formData);
  }
}
