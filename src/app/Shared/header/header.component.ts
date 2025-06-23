import { Component } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // ✅ correct syntax (note the plural!)
})
export class HeaderComponent {
  currentUser$: Observable<{ fullName: string, email: string } | null>;

  constructor(public userService: UserService) {
    this.currentUser$ = this.userService.currentUser$;
  
    this.currentUser$.subscribe(user => {
      console.log('👤 Header sees user:', user);
    });
  }
  
  logout() {
    this.userService.logout();
  }
}
