import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Candidate {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  createdAt: string;
  address?: string;
  educationLevel?: string;
  currentPosition?: string;
  preferredJobTitle?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private baseUrl = 'http://localhost:8089/SmartCruit/candidate';

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}/all`);
  }

  deleteCandidate(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${userId}`);
  }

  updateCandidate(id: number, updatedCandidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.baseUrl}/update/${id}`, updatedCandidate);
  }

  getCandidateCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
  
}
