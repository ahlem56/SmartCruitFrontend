// src/app/components/signup/signup.component.ts
import { Component } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-signup',
  standalone: true, // ✅ CORRECTION

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
    termsAccepted: false,
  };

  isLoading = false;

  constructor(private userService: UserService, private router: Router,private authService: SocialAuthService) {}

  onSubmit() {
    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const candidatePayload = {
      fullName: this.signupForm.fullName,
      email: this.signupForm.email,
      password: this.signupForm.password,
      phoneNumber: this.signupForm.phone,
      address: this.signupForm.address,
      createdAt: new Date(), // optionnel, peut être ignoré côté frontend
      currentPosition: '',           // 👈 default
      preferredJobTitle: '',        // 👈 default
      educationLevel: '',           // 👈 default
      profilePictureUrl: ''         // 👈 optional
    };

    this.isLoading = true;

    this.userService.signup(candidatePayload).subscribe({
      next: () => {
        
        this.userService.saveUser({  // ✅ Store current user for onboarding
          
          fullName: this.signupForm.fullName,
          email: this.signupForm.email,
          role: 'candidate',
          userId: this.signupForm.userId
        });
        
        this.isLoading = false;
        alert('Account created successfully!');
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Signup error:', err);
alert('Signup failed: ' + (err.error?.message || err.message || 'Unknown error'));

      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  showPassword = false;
  showConfirmPassword = false;

  hasError(field: string): boolean {
    // implement real validation if needed
    return false;
  }

  getErrorMessage(field: string): string {
    return 'Field is required';
  }

  goToLogin() {
    this.router.navigate(['/onboarding']);
  }

  signupWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      this.userService.googleLogin(user.idToken).subscribe({
        next: (res: any) => {
          this.userService.saveToken(res.token);
          this.userService.saveUser({  // ✅ This line was missing
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
          this.userService.saveUser({  // ✅ This line was missing
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
}
