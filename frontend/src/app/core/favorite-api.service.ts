import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { Favorite, FavoritesPayload } from './models';

@Injectable({ providedIn: 'root' })
export class FavoriteApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/favorites`;

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<FavoritesPayload> {
    return this.http.get<FavoritesPayload>(`${this.baseUrl}/my`);
  }

  add(propertyId: string, status = 'ACTIVE'): Observable<Favorite> {
    return this.http.post<Favorite>(this.baseUrl, { propertyId, status });
  }

  updateStatus(propertyId: string, status: string): Observable<Favorite> {
    return this.http.put<Favorite>(`${this.baseUrl}/${propertyId}`, { status });
  }

  remove(propertyId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${propertyId}`, { responseType: 'text' });
  }
}
