import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = 'http://localhost:8089/SmartCruit/application';

  constructor(private http: HttpClient) {}

  applyToJob(candidateId: number, jobOfferId: number, cvFile: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    console.log('candidateId:', candidateId);
    console.log('jobOfferId:', jobOfferId);
    console.log('cvFile:', cvFile);
    
    formData.append('candidateId', candidateId.toString());
    formData.append('jobOfferId', jobOfferId.toString());
    formData.append('cvFile', cvFile);
  
    if (additionalData) {
      formData.append('firstName', additionalData.firstName.trim());
      formData.append('lastName', additionalData.lastName.trim());
      formData.append('email', additionalData.email.trim());
      formData.append('phone', additionalData.phone.trim());
      formData.append('coverLetter', additionalData.coverLetter.trim());

    }
  
    return this.http.post(`${this.apiUrl}/apply`, formData);
  }

  getApplicationsByJobOffer(jobOfferId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8089/SmartCruit/application/byJobOffer/${jobOfferId}`);
  }
  
  acceptApplication(applicationId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/accept/${applicationId}`, {});
}

rejectApplication(applicationId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/reject/${applicationId}`, {});
}

getApplicationsByCandidate(candidateId: number): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8089/SmartCruit/application/byCandidate/${candidateId}`);
}

  
}
