import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { Property, PropertyDetailPayload } from './models';

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/properties`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(this.baseUrl);
  }

  getSortedByPrice(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/sorted-by-price`);
  }

  getById(propertyId: string): Observable<PropertyDetailPayload> {
    return this.http.get<PropertyDetailPayload>(`${this.baseUrl}/${propertyId}`);
  }

  getSellerProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/seller/me`);
  }

  add(formData: FormData): Observable<Property> {
    return this.http.post<Property>(this.baseUrl, formData);
  }

  update(propertyId: string, formData: FormData): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/${propertyId}`, formData);
  }

  delete(propertyId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${propertyId}`, { responseType: 'text' });
  }

  markSold(propertyId: string): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/${propertyId}/mark-sold`, {});
  }

  searchByPrice(minPrice: number, maxPrice: number): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/search/price`, {
      params: { minPrice, maxPrice }
    });
  }
}
