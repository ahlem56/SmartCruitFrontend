import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:8089/SmartCruit/company';

  constructor(private http: HttpClient) { }

  createCompany(companyData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, companyData);
  }

  getAllCompanies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }

  getCompanyById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/${id}`);
  }

  updateCompany(companyData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, companyData);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}