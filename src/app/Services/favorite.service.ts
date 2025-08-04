import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private apiUrl = 'http://localhost:8089/SmartCruit/favorites';

  constructor(private http: HttpClient) {}

  addFavorite(candidateId: number, jobOfferId: number): Observable<any> {
    const params = new HttpParams()
      .set('candidateId', candidateId)
      .set('jobOfferId', jobOfferId);
    return this.http.post(`${this.apiUrl}/add`, null, { params });
  }

  removeFavorite(candidateId: number, jobOfferId: number): Observable<any> {
    const params = new HttpParams()
      .set('candidateId', candidateId)
      .set('jobOfferId', jobOfferId);
    return this.http.delete(`${this.apiUrl}/remove`, { params });
  }

  getFavoritesByCandidate(candidateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/byCandidate/${candidateId}`);
  }
}
