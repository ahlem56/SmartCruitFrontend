import { Component } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  SocialAuthService,
  GoogleLoginProvider,
  FacebookLoginProvider,
  SocialUser
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: any = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    birthDate: '',
    termsAccepted: false
  };

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  serverErrors: string[] = [];
  maxDate = new Date().toISOString().split('T')[0]; // Today's date in yyyy-mm-dd

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: SocialAuthService
  ) {}

  onSubmit(form: NgForm) {
    this.serverErrors = [];

    if (form.invalid) {
      Object.keys(form.controls).forEach((fieldName) => {
        const control = form.controls[fieldName];
        if (control?.errors) {
          Object.keys(control.errors).forEach((errorKey) => {
            switch (errorKey) {
              case 'required':
                this.serverErrors.push(`${this.getFieldLabel(fieldName)} is required.`);
                break;
              case 'minlength':
                this.serverErrors.push(`${this.getFieldLabel(fieldName)} is too short.`);
                break;
              case 'maxlength':
                this.serverErrors.push(`${this.getFieldLabel(fieldName)} is too long.`);
                break;
              case 'email':
                this.serverErrors.push(`Invalid email format.`);
                break;
              case 'pattern':
                this.serverErrors.push(`${this.getFieldLabel(fieldName)} has an invalid format.`);
                break;
            }
          });
        }
      });
      return;
    }

    // Custom birthdate check
    const birth = new Date(this.signupForm.birthDate);
    const today = new Date();
    const minAge = 13;
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    const isTooYoung = age < minAge || (age === minAge && monthDiff < 0);
    if (birth > today) {
      this.serverErrors.push('Birthdate cannot be in the future.');
      return;
    }
    if (isTooYoung) {
      this.serverErrors.push(`You must be at least ${minAge} years old to sign up.`);
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.serverErrors.push('Passwords do not match.');
      return;
    }

    const candidatePayload = {
      fullName: this.signupForm.fullName,
      email: this.signupForm.email,
      password: this.signupForm.password,
      phoneNumber: this.signupForm.phone,
      address: this.signupForm.address,
      birthDate: this.signupForm.birthDate,
      createdAt: new Date(),
      currentPosition: '',
      preferredJobTitle: '',
      educationLevel: '',
      profilePictureUrl: ''
    };

    this.isLoading = true;

    this.userService.signup(candidatePayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.userService.saveUser({
          fullName: res.fullName,
          email: res.email,
          role: 'candidate',
          userId: res.userId
        });
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorData = err.error;
        if (Array.isArray(errorData)) {
          this.serverErrors = errorData;
        } else if (typeof errorData === 'string') {
          this.serverErrors = [errorData];
        } else {
          this.serverErrors = ['An unexpected error occurred.'];
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  signupWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      this.userService.googleLogin(user.idToken).subscribe({
        next: (res: any) => {
          this.userService.saveToken(res.token);
          this.userService.saveUser({
            fullName: res.fullName,
            email: res.email,
            role: 'candidate',
            userId: res.userId
          });
          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          console.error('❌ Google signup error:', err);
          alert('Signup with Google failed.');
        }
      });
    });
  }

  signupWithFacebook() {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      this.userService.facebookLogin(user.authToken).subscribe({
        next: (res: any) => {
          this.userService.saveToken(res.token);
          this.userService.saveUser({
            fullName: res.fullName,
            email: res.email,
            role: 'candidate',
            userId: res.userId
          });
          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          console.error('❌ Facebook signup error:', err);
          alert('Signup with Facebook failed.');
        }
      });
    });
  }

  signupWithLinkedIn() {
    alert('LinkedIn OAuth to be implemented');
  }

  goToHome() {
    this.router.navigate(['/onboarding']);
  }

  getFieldLabel(fieldName: string): string {
    switch (fieldName) {
      case 'fullName': return 'Full Name';
      case 'email': return 'Email';
      case 'password': return 'Password';
      case 'confirmPassword': return 'Confirm Password';
      case 'address': return 'Address';
      case 'birthDate': return 'Birth Date';
      case 'phone': return 'Phone Number';
      case 'termsAccepted': return 'Terms and Conditions';
      default: return fieldName;
    }
  }
}
