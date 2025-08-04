import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkWithHref, RouterModule } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { ApplicationService } from '../../../Services/application.service';
import { UserService } from '../../../Services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, FormsModule, RouterModule],
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
  
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.userId) {
      alert('You must be logged in to apply.');
      return;
    }
  
    const candidateId = currentUser.userId;
    const jobOfferId = this.jobOffer.jobOfferId;
    const cvFile = this.applicationForm.cvFile!;
    const additionalData = { ...this.applicationForm };
  
    this.applicationService.applyToJob(candidateId, jobOfferId, cvFile, additionalData).subscribe({
      next: (response) => {
        this.closeApplicationModal();
  
        const score = Math.round((response?.score ?? 0) * 100);
        const missingSkills = response?.missingSkills || [];
        const suggestedJobs = response?.suggestedJobs || [];
        const suggestedCourses = response?.suggestedCourses || [];
  
        const feedbackList = missingSkills.length
          ? `<ul>${missingSkills.map((s: string) => `<li>${s}</li>`).join("")}</ul>`
          : `<p style="color: green;">You meet all the job requirements!</p>`;
  
        const suggestionsList = suggestedJobs.length
          ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${suggestedJobs.slice(0, 3).map((job: any) => `
                <a 
                  href="/job-details/${job.jobId}" 
                  target="_blank"
                  style="display: flex; align-items: center; text-decoration: none; border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px; background: #fafafa; transition: background 0.3s ease;"
                  onmouseover="this.style.background='#f0f8ff'" 
                  onmouseout="this.style.background='#fafafa'"
                >
                  <img 
                    src="${job.logoUrl || 'assets/FrontOffice/images/default-company.png'}" 
                    alt="Logo"
                    style="width: 48px; height: 48px; object-fit: contain; border-radius: 6px; margin-right: 16px;"
                  />
                  <div style="flex: 1;">
                    <div style="font-size: 1rem; font-weight: 600; color: #007bff;">${job.title}</div>
                    <div style="font-size: 0.875rem; color: #555;">${job.company} • ${job.location}</div>
                  </div>
                  <i class="fas fa-arrow-right" style="color: #007bff;"></i>
                </a>
              `).join("")}
            </div>
          `
          : `<p style="color: #777; font-style: italic;">No matching jobs found.</p>`;
  
          const coursesList = suggestedCourses.length
          ? `
            <div style="margin-top: 1rem;">
              <p><strong>📚 Free YouTube Courses:</strong></p>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${suggestedCourses.map((course: any) => `
                  <a href="${course.url}" target="_blank" 
                     style="display: flex; align-items: center; text-decoration: none; border: 1px solid #ddd; border-radius: 10px; padding: 10px;">
                    <img 
                      src="https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg" 
                      alt="YouTube Thumbnail"
                      style="width: 120px; height: auto; border-radius: 6px; margin-right: 12px;"
                    />
                    <div style="flex: 1;">
                      <div style="font-size: 0.95rem; font-weight: 600; color: #007bff;">${course.title}</div>
                      <div style="font-size: 0.8rem; color: #555;">Skill: ${course.skill}</div>
                    </div>
                    <i class="fab fa-youtube" style="font-size: 1.5rem; color: red;"></i>
                  </a>
                `).join("")}
              </div>
            </div>
          `
          : "";
        
        Swal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          html: `
            <div style="text-align: left; font-family: 'Segoe UI', sans-serif; font-size: 0.95rem;">
              <p><strong>Matching Score:</strong> <span style="color:#007bff;">${score}%</span></p>
              <p><strong>Missing Skills:</strong></p>
              ${feedbackList}
              <p style="margin-top: 1rem;"><strong>Top 3 Job Suggestions:</strong></p>
              ${suggestionsList}
              ${coursesList}
            </div>
          `,
          confirmButtonText: 'Close',
          customClass: {
            popup: 'swal2-rounded swal2-shadow',
            confirmButton: 'btn btn-primary'
          }
        });
      },
      error: (err) => {
        console.error('❌ Application submission error:', err);
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

  viewEmployerProfile(employerId: number): void {
  this.router.navigate(['/backoffice/employer-profile', employerId]);
}

  
} 