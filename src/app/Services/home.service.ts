// src/app/services/home.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private BASE_URL = 'http://localhost:8089/SmartCruit/api/home';

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<{ jobs: number; companies: number; candidates: number }>(`${this.BASE_URL}/stats`);
  }

  getTopCompanies() {
    return this.http.get<any[]>(`${this.BASE_URL}/top-companies`);
  }

  getJobCategories() {
    return this.http.get<any[]>(`${this.BASE_URL}/job-categories`);
  }

  getFeaturedJobs() {
    return this.http.get<any[]>(`${this.BASE_URL}/featured-jobs`);
  }
}
