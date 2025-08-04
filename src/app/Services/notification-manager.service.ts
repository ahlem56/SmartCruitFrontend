// notification-manager.service.ts
import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class NotificationManagerService {
  private lastUnreadCount = 0;
  private toastCallback: ((msg: string) => void) | null = null;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  init(callback: (message: string) => void) {
    this.toastCallback = callback;

    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.notificationService.getLiveNotifications(user.userId).subscribe({
      next: (notifications) => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length > this.lastUnreadCount && this.toastCallback) {
          this.toastCallback(unread[0].message);
        }
        this.lastUnreadCount = unread.length;
      },
      error: (err) => {
        console.error('❌ Notification stream error', err);
      }
    });
  }
}
