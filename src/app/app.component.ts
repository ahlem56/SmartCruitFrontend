import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './Shared/header/header.component';
import { HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule,HttpClientModule],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  showHeader = true;

  constructor(private router: Router) {
    // Subscribe to route changes
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      this.showHeader = !['/login', '/signup', '/forgot-password', '/reset-password', '/onboarding'].includes(currentUrl);
    });
  }
}
