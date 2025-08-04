import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceEmployerService {
  private baseUrl = 'http://localhost:8089/SmartCruit/employer/dashboard';

  constructor(private http: HttpClient) {}

  getApplicationsSummary(employerId: number): Observable<{ today: number, thisWeek: number, thisMonth: number }> {
    return this.http.get<{ today: number, thisWeek: number, thisMonth: number }>(
      `${this.baseUrl}/applicationsSummary/${employerId}`
    );
  }

  getUpcomingInterviews(employerId: number): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/upcomingInterviews/${employerId}`
    );
  }

  getFunnelStats(employerId: number): Observable<{ [status: string]: number }> {
    return this.http.get<{ [status: string]: number }>(
      `${this.baseUrl}/funnel/${employerId}`
    );
  }


  getKpis(employerId: number): Observable<{totalApplications: number, highMatches: number, totalJobOffers: number, avgProcessingTime: number, autoRejectRate: number
  }> {
    return this.http.get<{
      totalApplications: number,
      highMatches: number,
      totalJobOffers: number,
      avgProcessingTime: number,
      autoRejectRate: number
    }>(`${this.baseUrl}/kpis/${employerId}`);
  }
  

  getTopCandidates(employerId: number): Observable<{ name: string, avatarUrl: string, count: number }[]> {
    return this.http.get<{ name: string, avatarUrl: string, count: number }[]>(
      `${this.baseUrl}/topCandidates/${employerId}`
    );
  }
  
  getTopJobOffers(employerId: number): Observable<{ title: string, applicationsCount: number }[]> {
    return this.http.get<{ title: string, applicationsCount: number }[]>(
      `${this.baseUrl}/topOffers/${employerId}`
    );
  }
  
  getUpcomingInterviewsDetailed(employerId: number): Observable<{ candidateName: string, date: string }[]> {
    return this.http.get<{ candidateName: string, date: string }[]>(
      `${this.baseUrl}/upcomingDetailed/${employerId}`
    );
  }

  getTopMatches(employerId: number): Observable<{ candidateName: string, jobTitle: string, score: number }[]> {
    return this.http.get<{ candidateName: string, jobTitle: string, score: number }[]>(
      `${this.baseUrl}/topMatches/${employerId}`
    );
  }
  
  
}
