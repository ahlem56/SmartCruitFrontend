import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../Services/notification.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  userId!: number;
  showDropdown = false;
  latestUnreadCount = 0;
  toastMessage = '';
  activeTab: 'unread' | 'read' | 'all' = 'unread';




  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (!user) return;
    this.userId = user.userId;
  
    this.notificationService.getLiveNotifications(user.userId).subscribe();
  
    // Subscribe to local BehaviorSubject changes
    this.notificationService.notifications$.subscribe((data) => {
      const newNotifications = data.filter(n => !n.read);
      this.latestUnreadCount = newNotifications.length;
  
      this.notifications = data.map(n => ({
        ...n,
        avatarUrl: n.sender?.profilePictureUrl || 'assets/FrontOffice/images/default.avif'
      }));
    });
  }
  

  loadNotifications(): void {
    console.log('Loading notifications for user ID:', this.userId);
  
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: (data) => {
        console.log('✅ Received notifications:', data);
        
        this.notifications = data.map(n => ({
          ...n,
          avatarUrl: n.sender?.profilePictureUrl || n.recipient?.profilePictureUrl || 'assets/FrontOffice/images/default.avif'
        }));
  
        console.log('🔍 Notifications with avatars:', this.notifications);
      },
      error: (err) => console.error('❌ Error fetching notifications', err)
    });
  }
  
  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Find the notification in the local array and mark it read
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
          notif.read = true;
        }
        this.latestUnreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: (err) => console.error('Error marking as read', err)
    });
  }
  

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  highlightLatest(message: string): string {
    // Optionally bold the first sentence or customize rules
    const firstSentence = message.split('.')[0];
    return message.replace(firstSentence, `<strong>${firstSentence}</strong>`);
  }
  dismissNotification(id: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent triggering markAsRead
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  setTab(tab: 'unread' | 'read' | 'all'): void {
    this.activeTab = tab;
  }
  
  filteredNotifications(): Notification[] {
    switch (this.activeTab) {
      case 'unread': return this.notifications.filter(n => !n.read);
      case 'read': return this.notifications.filter(n => n.read);
      default: return this.notifications;
    }
  }
    
}
