import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ])
  ]
})
export class OnboardingComponent {
  step = 1;

  onboardingData: any = {
    currentPosition: '',
    preferredJobTitle: '',
    experienceYears: '',
    desiredSalaryRange: '',
    primarySkills: '',
    secondarySkills: '',
    toolsOrTechnologies: '',
    educationLevel: '',
    degreeField: '',
    certifications: '',
    preferredWorkType: '',
    availability: '',
    relocationWillingness: '',
    workLocation: '',
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: ''
  };

  constructor(private userService: UserService, private router: Router) {}

  next(): void {
    if (this.step < 5) this.step++;
  }

  prev(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    const user = this.userService.getCurrentUser();
    if (!user) {
      alert('User not logged in');
      return;
    }

    console.log('📤 Submitting onboarding data:', this.onboardingData);

    this.userService.updateProfile(user.email, this.onboardingData).subscribe({
      next: () => {
        console.log('✅ Profile updated successfully');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Profile update failed:', err);
        alert('Profile update failed');
      }
    });
  }
}
