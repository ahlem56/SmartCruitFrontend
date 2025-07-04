import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { SocialAuthService, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class LoginComponent implements AfterViewInit {
  email = '';
  password = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private socialAuthService: SocialAuthService // ✅ inject SocialAuthService
  ) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '559943847914-138movu7ml236e7d3fbtnmd4gpdpm2ag.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn-container'),
      { theme: 'outline', size: 'large', width: 240 }
    );
  }

  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    console.log('✅ ID token Google:', idToken);

    this.userService.googleLogin(idToken).subscribe({
      next: (res: any) => {
        this.userService.saveToken(res.token);
        const normalizedRole = res.role.toLowerCase();

this.userService.saveUser({
  fullName: res.fullName,
  email: res.email,
  role: normalizedRole as 'employer' | 'candidate' | 'admin',
  userId: res.userId  
});

if (normalizedRole === 'admin') {
  this.router.navigate(['/backoffice/dashboard']);
} else if (normalizedRole === 'employer') {
  this.router.navigate(['/employer/dashboard']);
} else {
  this.router.navigate(['/home']);
}


        
      },
      error: (err) => {
        console.error('❌ Google login failed:', err);
        alert('Google login error.');
      }
    });
  }

  // ✅ Add this method
  onLogin() {
    console.log('🚀 Form submitted with:', this.email, this.password);
    this.userService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        console.log('✅ Backend response:', res);
        this.userService.saveToken(res.token);
  
        const normalizedRole = res.role.toLowerCase();
        this.userService.saveUser({
          fullName: res.fullName,
          email: res.email,
          role: normalizedRole as 'employer' | 'candidate' | 'admin',
          userId: res.userId  
        });
  
        if (normalizedRole === 'admin') {
          this.router.navigate(['/backoffice/dashboard']);
        } else if (normalizedRole === 'employer') {
          this.router.navigate(['/employer/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
        
      },
      error: () => {
        alert('Invalid email or password.');
      }
    });
  }
  
  onFacebookLogin(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      console.log('✅ Facebook user:', user);
  
      this.userService.facebookLogin(user.authToken).subscribe({
        next: (res: any) => {
          this.userService.saveToken(res.token);
  
          const normalizedRole = res.role.toLowerCase();
          this.userService.saveUser({
            fullName: res.fullName,
            email: res.email,
            role: normalizedRole as 'employer' | 'candidate',
            userId: res.userId  
          });
  
          if (normalizedRole === 'admin') {
            this.router.navigate(['/backoffice/dashboard']);
          } else if (normalizedRole === 'employer') {
            this.router.navigate(['/employer/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
          
        },
        error: (err) => {
          console.error('❌ Facebook login failed:', err);
          alert('Facebook login error.');
        }
      });
    });
  }
  
  
}
