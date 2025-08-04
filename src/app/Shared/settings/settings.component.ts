import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Services/user.service';
import { ThemeService } from '../../Services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  settingsForm: FormGroup;
  currentEmail = '';

  constructor(private fb: FormBuilder, private userService: UserService,private themeService: ThemeService) {
    this.currentEmail = this.userService.getCurrentUser()?.email || '';
    
    this.settingsForm = this.fb.group({
      email: [this.currentEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      language: ['en'],
      notifications: this.fb.group({
        email: [true],
        sms: [false],
        app: [true]
      }),
      twoFactorAuth: [false]
    });
  }

  save(): void {
    if (this.settingsForm.valid) {
      const { email, password } = this.settingsForm.value;
      const updates: { email?: string; password?: string } = {};

      if (email !== this.currentEmail) updates.email = email;
      if (password) updates.password = password;

      this.userService.updateCredentials(this.currentEmail, updates).subscribe({
        next: () => {
          if (updates.email) {
            const updatedUser = this.userService.getCurrentUser();
            if (updatedUser) {
              updatedUser.email = updates.email;
              this.userService.saveUser(updatedUser);
            }
          }
          alert('✅ Credentials updated successfully.');
        },
        error: (err) => {
          console.error('❌ Failed to update credentials', err);
          alert('Error updating settings');
        }
      });
    }
  }

  get isDark(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
