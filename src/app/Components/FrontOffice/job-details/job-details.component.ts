import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkWithHref, RouterModule } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { ApplicationService } from '../../../Services/application.service';
import { UserService } from '../../../Services/user.service';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkWithHref, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  loading = true;
  error = false;
  showApplicationModal = false;

  // Application form data
  applicationForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
    cvFile: null as File | null,
    cvFileName: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOffersService: JobOffersService,
    private applicationService: ApplicationService,
    private userService: UserService  

  ) {}

  ngOnInit(): void {
    this.loadJobDetails();
  }

  loadJobDetails(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobOffersService.getJobOfferById(+jobId).subscribe({
        next: (jobOffer) => {
          if (jobOffer) {
            this.jobOffer = jobOffer;
          } else {
            this.error = true;
          }
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  openApplicationModal(): void {
    this.showApplicationModal = true;
    this.resetApplicationForm();
  }

  closeApplicationModal(): void {
    this.showApplicationModal = false;
    this.resetApplicationForm();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.applicationForm.cvFile = file;
      this.applicationForm.cvFileName = file.name;
    }
  }

  removeFile(): void {
    this.applicationForm.cvFile = null;
    this.applicationForm.cvFileName = '';
  }

  submitApplication(): void {
    if (!this.validateForm()) return;
  
    if (!this.jobOffer) {
      alert("Job details are missing.");
      return;
    }
  
    // Récupération dynamique du candidat connecté
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      alert('Vous devez être connecté pour postuler.');
      return;
    }
  
    const candidateId = currentUser.userId;
    const jobOfferId = this.jobOffer.jobOfferId;
    const cvFile = this.applicationForm.cvFile!;
  
    const additionalData = {
      firstName: this.applicationForm.firstName,
      lastName: this.applicationForm.lastName,
      email: this.applicationForm.email,
      phone: this.applicationForm.phone,
      coverLetter: this.applicationForm.coverLetter,
    };
  
    this.applicationService.applyToJob(candidateId, jobOfferId, cvFile, additionalData)
      .subscribe({
        next: () => {
          alert('Application submitted successfully!');
          this.closeApplicationModal();
        },
        error: (err) => {
          console.error('Application submission error:', err);
          alert('Failed to submit application. Please try again later.');
        }
      });
  }
  
  

  private validateForm(): boolean {
    if (!this.applicationForm.firstName.trim()) {
      alert('Please enter your first name');
      return false;
    }
    if (!this.applicationForm.lastName.trim()) {
      alert('Please enter your last name');
      return false;
    }
    if (!this.applicationForm.email.trim()) {
      alert('Please enter your email');
      return false;
    }
    if (!this.isValidEmail(this.applicationForm.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!this.applicationForm.phone.trim()) {
      alert('Please enter your phone number');
      return false;
    }
    if (!this.applicationForm.coverLetter.trim()) {
      alert('Please enter your cover letter');
      return false;
    }
    if (!this.applicationForm.cvFile) {
      alert('Please upload your CV');
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetApplicationForm(): void {
    this.applicationForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      coverLetter: '',
      cvFile: null,
      cvFileName: ''
    };
  }

  getStatusColor(status: JobOffer['status']): string {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-red-600 bg-red-100';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
  
  getTypeColor(type: JobOffer['jobType']): string {
    switch (type) {
      case 'FULL_TIME': return 'text-blue-600 bg-blue-100';
      case 'PART_TIME': return 'text-purple-600 bg-purple-100';
      case 'CONTRACT': return 'text-orange-600 bg-orange-100';
      case 'INTERNSHIP': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
  

  goBack(): void {
    this.router.navigate(['/job-offers']);
  }

  messageEmployer(): void {
    const employerId = this.jobOffer?.employer?.userId;
    if (employerId) {
      this.router.navigate(['/chat'], { queryParams: { to: employerId } });
    }
  }
  
} 