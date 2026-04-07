import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { Booking } from './models';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/bookings`;

  constructor(private readonly http: HttpClient) {}

  create(payload: { propertyId: string; message: string; scheduledDate: string }): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, payload);
  }

  getMy(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/my`);
  }

  getSeller(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/seller`);
  }

  getAdmin(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/admin`);
  }

  updateStatus(requestId: string, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${requestId}`, { status });
  }

  delete(requestId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${requestId}`, { responseType: 'text' });
  }
}
