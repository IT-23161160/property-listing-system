import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { Review } from './models';

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/reviews`;

  constructor(private readonly http: HttpClient) {}

  getByProperty(propertyId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/property/${propertyId}`);
  }

  add(payload: { propertyId: string; rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, payload);
  }

  update(reviewId: string, payload: { rating: number; comment: string }): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${reviewId}`, payload);
  }

  delete(reviewId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${reviewId}`, { responseType: 'text' });
  }
}
