import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('http://localhost:8089/SmartCruit/user/forgot-password', { email: this.email })
      .subscribe({
        next: () => {
          this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.';
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur : impossible d’envoyer le lien.';
          this.isSubmitting = false;
        }
      });
  }
}
