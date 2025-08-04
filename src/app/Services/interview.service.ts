import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Interview {
  interviewId: number;
  proposedDate: string;
  confirmedDate?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  location: string;
  notes: string;
  employer: any;
  candidate?: any;
  application?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = 'http://localhost:8089/SmartCruit/interviews';

  constructor(private http: HttpClient) {}

 proposeInterview(interview: Interview): Observable<Interview> {
  const params = new URLSearchParams({
    applicationId: interview.application.applicationId,
    employerId: interview.employer.userId,
    proposedDate: interview.proposedDate,
    location: interview.location,
    notes: interview.notes ?? ''
  });

  return this.http.post<Interview>(`${this.baseUrl}/propose?${params.toString()}`, {});
}


confirmInterview(interviewId: number, confirmedDate: string): Observable<Interview> {
  return this.http.put<Interview>(
    `${this.baseUrl}/confirm?interviewId=${interviewId}&confirmedDate=${confirmedDate}`,
    {}
  );
}

  cancelInterview(interviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cancel/${interviewId}`);
  }

  getInterviewsForCandidate(candidateId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/candidate/${candidateId}`);
  }

  getInterviewsForEmployer(employerId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/employer/${employerId}`);
  }

  exportIcs(interviewId: number): string {
    return `${this.baseUrl}/export-ics/${interviewId}`;
  }
}
