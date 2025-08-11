// src/app/Services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;

  newUsers24h: number;
  newJobs24h: number;
  newApplications24h: number;

    totalCompanies: number;       // ✅ Already present
  totalCandidates: number;      // ✅ Add this
  totalEmployers: number;       // ✅ Add this

  newUsers7d: number;
  newJobs7d: number;
  newApplications7d: number;

  newUsers30d: number;
  newJobs30d: number;
  newApplications30d: number;
}

export interface UserRankDto {
  name: string;
  avatarUrl: string;
  count: number;
}

export interface CompanyRankDto {
  name: string;
  logoUrl: string;
  count: number;
}

export interface UserEngagementStats {
  topCandidates: UserRankDto[];
  topEmployers: UserRankDto[];
  topCompanies: CompanyRankDto[];
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = 'http://localhost:8089/SmartCruit/admin/dashboard'; // Adjust if different

  constructor(private http: HttpClient) {}

  getOverview(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.baseUrl}/overview`);
  }

  getEngagementStats(): Observable<UserEngagementStats> {
  return this.http.get<UserEngagementStats>(`${this.baseUrl}/engagement`);
}

getTopMatchesGlobal(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/topMatchesGlobal`);
}

getTopCategories(): Observable<{ category: string; count: number }[]> {
  return this.http.get<{ category: string; count: number }[]>(`${this.baseUrl}/topCategories`);
}


}
