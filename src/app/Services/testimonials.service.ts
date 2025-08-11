import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Testimonial {
  id?: number;
  content: string;
  rating: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
  moderationNote?: string | null;
  authorId?: number;
  authorName?: string;
  /** Optional avatar URL for the author (frontend-only convenience). */
  authorProfilePictureUrl?: string; // <-- new

}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page index
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class TestimonialsService {
  private base = 'http://localhost:8089/SmartCruit/testimonials';

  constructor(private http: HttpClient) {}

  /** Helper: build Authorization header from localStorage token */
  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders(
        token ? { Authorization: `Bearer ${token}` } : {}
      )
    };
  }

  /** Public (no auth) */
  getPublic(page = 0, size = 10): Observable<Page<Testimonial>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Testimonial>>(`${this.base}/public`, { params });
  }

  /** Logged-in user (requires token) */
  getMine(page = 0, size = 10): Observable<Page<Testimonial>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Testimonial>>(`${this.base}/mine`, {
      params,
      ...this.authHeaders()
    });
  }

  create(payload: Pick<Testimonial, 'content' | 'rating'>): Observable<Testimonial> {
    return this.http.post<Testimonial>(this.base, payload, this.authHeaders());
  }

  update(id: number, payload: Pick<Testimonial, 'content' | 'rating'>): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${this.base}/${id}`, payload, this.authHeaders());
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`, this.authHeaders());
  }

  /** Admin (requires token) */
  listAll(status?: 'PENDING'|'APPROVED'|'REJECTED', page = 0, size = 10): Observable<Page<Testimonial>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Testimonial>>(this.base, { params, ...this.authHeaders() });
  }

  approve(id: number, note?: string): Observable<Testimonial> {
    return this.http.patch<Testimonial>(`${this.base}/${id}/approve`, note ? { note } : {}, this.authHeaders());
  }

  reject(id: number, note?: string): Observable<Testimonial> {
    return this.http.patch<Testimonial>(`${this.base}/${id}/reject`, note ? { note } : {}, this.authHeaders());
  }
}
