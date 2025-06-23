import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ResetPasswordComponent {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  togglePasswordVisibility(fieldName: string) {
    const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    const button = document.querySelector(`button[onclick*="${fieldName}"]`) as HTMLButtonElement;
    
    if (input && button) {
      if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
      }
    }
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('http://localhost:8089/SmartCruit/user/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe réinitialisé avec succès. Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur de réinitialisation du mot de passe.';
        this.isSubmitting = false;
      }
    });
  }
}
