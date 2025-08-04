import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './Services/user.service';

@Injectable({ providedIn: 'root' })
export class EmployerGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const role = this.userService.getUserRole();
    if (role === 'employer') return true;

    this.router.navigate(['/**']);
    return false;
  }
}
