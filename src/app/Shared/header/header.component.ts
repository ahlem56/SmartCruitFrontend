// header.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { NotificationService } from '../../Services/notification.service';
import { Router, RouterLink, RouterLinkWithHref } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { InterviewService } from '../../Services/interview.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkWithHref, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<any>;
  recipientId: string = '';
  unreadCount: number = 0;
pendingInterviewCount: number = 0;

  constructor(
    public userService: UserService,
    private notificationService: NotificationService,
      private interviewService: InterviewService ,// ✅ Injected
      private router: Router // ✅ Inject Router

  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
  this.currentUser$.subscribe(user => {
    if (!user) return;

    // Fetch chat recipient
    this.userService.getConversationContacts(user.userId).subscribe({
      next: (contacts) => {
        if (contacts.length > 0) this.recipientId = contacts[0].userId;
      }
    });

    // Load notifications
    this.notificationService.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
    this.notificationService.refreshNotifications(user.userId);

    // ✅ Load pending interviews
    const fetch$ = user.role === 'employer'
      ? this.interviewService.getInterviewsForEmployer(user.userId)
      : this.interviewService.getInterviewsForCandidate(user.userId);

    fetch$.subscribe({
      next: interviews => {
        this.pendingInterviewCount = interviews.filter(i => i.status === 'PENDING').length;
      },
      error: err => console.error('❌ Failed to fetch interviews', err)
    });
  });
}



logout() {
  this.userService.logout();
  this.router.navigate(['/login']); // ✅ Redirect to login route
}
}
