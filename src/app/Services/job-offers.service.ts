import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyService } from './company.service';

export type JobCategory = 'TECHNOLOGY' | 'DESIGN' | 'MARKETING' | 'SALES' | 'EDUCATION' | 'HEALTHCARE';

export interface JobOffer {
  jobOfferId: number;
  title: string;
  description: string;
  salary: number;
  jobLocation: string;
  requiredSkills: string[];
  requiredLanguages: string[];
  benefits: string[];
  educationLevel: string;
  experienceLevel: string;
  category: JobCategory;  // ✅ <-- Add this line
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  numberOfOpenPositions: number;
  postedDate: string;
  deadline: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';

  employer?: {
    userId: number;
    fullName?: string;
    email?: string;
    profilePictureUrl?: string;
    industry?: string;
    contact?: string;
    linkedInUrl?: string;
    githubUrl?: string;

  };

  company?: {
    companyId: number;
    name?: string;
    logoUrl?: string;
    description?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    linkedInUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
  } | null;

  applicationsCount?: number;
}

@Injectable({ providedIn: 'root' })
export class JobOffersService {
  private readonly apiUrl = 'http://localhost:8089/SmartCruit/jobOffer';

  constructor(
    private http: HttpClient,
    private companyService: CompanyService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  // 🔹 Fetch All Job Offers
  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/getAll`);
  }

  // 🔹 Get Job Offer by ID
  getJobOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/get/${id}`);
  }

  // 🔹 Add New Job Offer
  addJobOffer(jobOffer: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/create`, jobOffer, {
      headers: this.getAuthHeaders()
    });
  }

  // 🔹 Update Job Offer
  updateJobOffer(id: number, updates: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/update/${id}`, updates, {
      headers: this.getAuthHeaders()
    });
  }

  // 🔹 Delete Job Offer
  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // 🔹 Update Status Only
  updateJobOfferStatus(id: number, status: JobOffer['status']): Observable<JobOffer> {
    return this.updateJobOffer(id, { status });
  }

  // 🔹 Proxy to fetch companies if needed
  getCompanies(): Observable<ReturnType<CompanyService['getAllCompanies']>> {
    return this.companyService.getAllCompanies();
  }
}
