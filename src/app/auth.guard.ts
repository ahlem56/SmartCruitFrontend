import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './Services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser();
    if (user && (user.role === 'candidate' || user.role === 'employer')) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
