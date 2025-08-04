// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeKey = 'darkMode';

  constructor() {
    const saved = localStorage.getItem(this.darkModeKey);
    if (saved === 'true') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark-mode');
  }

  toggleTheme(): void {
    this.isDarkMode() ? this.disableDarkMode() : this.enableDarkMode();
  }

  enableDarkMode(): void {
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem(this.darkModeKey, 'true');
  }

  disableDarkMode(): void {
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem(this.darkModeKey, 'false');
  }
}
