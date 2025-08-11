// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeKey = 'darkMode';
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    console.log('ThemeService initialized');
    const saved = localStorage.getItem(this.darkModeKey);
    console.log('Saved theme preference:', saved);
    if (saved === 'true') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  isDarkMode(): boolean {
    const isDark = document.documentElement.classList.contains('dark-mode');
    console.log('Current theme state:', isDark ? 'dark' : 'light');
    return isDark;
  }

  toggleTheme(): void {
    console.log('Toggling theme');
    this.isDarkMode() ? this.disableDarkMode() : this.enableDarkMode();
  }

  enableDarkMode(): void {
    console.log('Enabling dark mode');
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem(this.darkModeKey, 'true');
    this.darkModeSubject.next(true);
    console.log('Dark mode enabled, classes:', document.documentElement.classList.toString());
  }

  disableDarkMode(): void {
    console.log('Disabling dark mode');
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem(this.darkModeKey, 'false');
    this.darkModeSubject.next(false);
    console.log('Dark mode disabled, classes:', document.documentElement.classList.toString());
  }

  // Method to get current theme state
  getCurrentTheme(): boolean {
    return this.isDarkMode();
  }
}
