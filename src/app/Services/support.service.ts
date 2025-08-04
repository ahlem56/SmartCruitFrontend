import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = 'http://localhost:8089/SmartCruit/api/support/send';

  constructor(private http: HttpClient) {}

  submitSupportRequest(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
