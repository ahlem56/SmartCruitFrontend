import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, startWith, switchMap, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  recipient: {
    userId: number;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
  };
  sender: {
    userId: number;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
  };
  avatarUrl?: string; // ✅ add this

}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8089/SmartCruit/notifications';

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable(); // Exposed to all components

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read/${notificationId}`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updated);
      })
    );
  }
  


  getLiveNotifications(userId: number): Observable<Notification[]> {
    return interval(15000).pipe(
      startWith(0),
      switchMap(() => this.getUserNotifications(userId)),
      tap((notifications: Notification[]) => this.notificationsSubject.next(notifications))
    );
  }

  refreshNotifications(userId: number): void {
    this.getUserNotifications(userId).subscribe((data: Notification[]) => {
      this.notificationsSubject.next(data);
    });
  }

  private getCurrentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.userId;
  }
}
