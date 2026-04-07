import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './config';
import { Category } from './models';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly baseUrl = `${API_BASE_URL}/api/categories`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  add(name: string): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, { name });
  }

  update(categoryId: string, name: string): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${categoryId}`, { name });
  }

  delete(categoryId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${categoryId}`, { responseType: 'text' });
  }
}
