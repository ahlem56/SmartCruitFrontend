import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8089/SmartCruit/user'; // adapte si nécessaire
  private currentUserSubject = new BehaviorSubject<{ fullName: string, email: string, role: 'candidate' | 'employer' | 'admin'  , userId: number, profilePictureUrl?: string } | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

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
  saveUser(user: { fullName: string, email: string, role: 'candidate' | 'employer' | 'admin', userId: number, profilePictureUrl?: string }) {
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
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        
      }
    });
  }
  
  

  updateProfile(email: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile/${email}`, data);
  }
  
  getCurrentUser(): { fullName: string; email: string; role: 'candidate' | 'employer' | 'admin', userId: number, profilePictureUrl?: string } | null {
    const data = localStorage.getItem('currentUser');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  getUserRole(): 'candidate' | 'employer' | 'admin' | null {
    return this.getCurrentUser()?.role ?? null;
  }
  

  uploadProfilePicture(email: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/upload-profile-picture/${email}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  
  refreshCurrentUserProfile() {
    const current = this.getCurrentUser();
    if (!current) return;
  
    this.getProfile().subscribe({
      next: (profile) => {
        const updatedUser = {
          ...current,
          fullName: profile.fullName,
          profilePictureUrl: profile.profilePictureUrl
        };
        this.saveUser(updatedUser); // <-- This triggers the BehaviorSubject & saves to localStorage
      },
      error: (err) => {
        console.error('❌ Failed to refresh current user profile', err);
      }
    });
  }
  
  
  updateCredentials(currentEmail: string, updates: { email?: string; password?: string }): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/update-credentials/${currentEmail}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUserById(userId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/user/${userId}`); // Adjust URL to your backend
}

  // user.service.ts
getConversationContacts(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8089/SmartCruit/conversations/${userId}`);
}

}
