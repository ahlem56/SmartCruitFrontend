import { Component } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { RouterLink, RouterLinkWithHref } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkWithHref, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currentUser$: Observable<any>;
  recipientId: string = '';

  constructor(public userService: UserService) {
    this.currentUser$ = this.userService.currentUser$;

    this.currentUser$.subscribe(user => {
      console.log('👤 Header sees user:', user);

      // Example: if the logged-in user is a candidate, set recipient to a known employer ID
      if (user?.role === 'candidate') {
        this.recipientId = '12'; // replace with dynamic value from recent conversations or a chat list
      } else if (user?.role === 'employer') {
        this.recipientId = '16'; // e.g., candidate ID
      }
    });
  }

  logout() {
    this.userService.logout();
  }
}
