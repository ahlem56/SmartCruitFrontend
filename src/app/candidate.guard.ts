import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './Services/user.service';


@Injectable({
  providedIn: 'root'
})
export class CandidateGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser();

    if (user && user.role === 'candidate') {
      return true;
    }

    // 🚫 Not authorized → redirect to home or login
    this.router.navigate(['/**']);
    return false;
  }
}
