import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8089/SmartCruit/user'; // adapte si nécessaire
  private currentUserSubject = new BehaviorSubject<{ fullName: string, email: string } | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const userData = localStorage.getItem('currentUser');
    if (userData) this.currentUserSubject.next(JSON.parse(userData));}

  signup(candidate: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, candidate);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('authToken', token);
  }
  saveUser(user: { fullName: string, email: string }) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  googleLogin(idToken: string) {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken }); // ✅
  }
  
  facebookLogin(authToken: string) {
    return this.http.post(`${this.apiUrl}/facebook-login`, { authToken });
  }
  

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: {
        Authorization: 'Bearer ' + this.getToken()
      }
    });
  }
  
}
