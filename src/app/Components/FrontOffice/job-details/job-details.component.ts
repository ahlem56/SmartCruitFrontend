import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { ApplicationService } from '../../../Services/application.service';
import { UserService } from '../../../Services/user.service';
import Swal from 'sweetalert2';

// Google Analytics tracking function
declare let gtag: Function;

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  loading = true;
  error = false;
  showApplicationModal = false;

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
    this.loadJobDetails(); // only call this
  }
  
  loadJobDetails(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobOffersService.getJobOfferById(+jobId).subscribe({
        next: (jobOffer) => {
          this.jobOffer = jobOffer ?? null;
          this.loading = false;
  
          // ✅ Track after loading the job
          gtag('event', 'job_offer_view', {
            job_id: jobOffer.jobOfferId,
            job_title: jobOffer.title,
            employer_id: jobOffer.employer?.userId || '',
            page_path: `/job-details/${jobOffer.jobOfferId}`,
            page_title: 'Job Details'
          });
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
    if (!this.validateForm() || !this.jobOffer) return;

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.userId) {
      alert('You must be logged in to apply.');
      return;
    }

    const { userId } = currentUser;
    const jobOfferId = this.jobOffer.jobOfferId;
    const cvFile = this.applicationForm.cvFile!;

    this.applicationService.applyToJob(userId, jobOfferId, cvFile, { ...this.applicationForm }).subscribe({
      next: (res) => {
        this.closeApplicationModal();
        this.showSuccessModal(res);
      },
      error: () => alert('Failed to submit application. Please try again later.')
    });
  }

  showSuccessModal(response: any): void {
    const score = Math.round((response?.score ?? 0) * 100);
    const missingSkills = response?.missingSkills || [];
    const suggestedJobs = response?.suggestedJobs || [];
    const suggestedCourses = response?.suggestedCourses || [];

    const feedbackList = missingSkills.length
      ? `<ul>${missingSkills.map((s: string) => `<li>${s}</li>`).join('')}</ul>`
      : `<p style="color: green;">You meet all the job requirements!</p>`;

    const jobSuggestions = suggestedJobs.length
      ? suggestedJobs.slice(0, 3).map((job: any) => `
        <a href="/job-details/${job.jobId}" target="_blank" class="suggested-job-link">
          <img src="${job.logoUrl || 'assets/FrontOffice/images/default-company.png'}" alt="Logo" />
          <div>
            <strong>${job.title}</strong><br/>
            <span>${job.company} • ${job.location}</span>
          </div>
        </a>`).join('')
      : `<p>No matching jobs found.</p>`;

    const courses = suggestedCourses.length
      ? suggestedCourses.map((course: any) => `
        <a href="${course.url}" target="_blank" class="course-link">
          <img src="https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg" alt="Thumbnail" />
          <div>
            <strong>${course.title}</strong><br/>
            <span>Skill: ${course.skill}</span>
          </div>
        </a>`).join('')
      : '';

    Swal.fire({
      icon: 'success',
      title: 'Application Submitted!',
      html: `
        <p><strong>Matching Score:</strong> ${score}%</p>
        <p><strong>Missing Skills:</strong></p>
        ${feedbackList}
        <p><strong>Top Job Suggestions:</strong></p>
        ${jobSuggestions}
        ${courses ? '<p><strong>Recommended Courses:</strong></p>' + courses : ''}
      `,
      confirmButtonText: 'Close'
    });
  }

  private validateForm(): boolean {
    const { firstName, lastName, email, phone, coverLetter, cvFile } = this.applicationForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim() || !cvFile) {
      alert('Please complete all fields and upload your CV.');
      return false;
    }
    if (!this.isValidEmail(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    return {
      'ACTIVE': 'text-green-600 bg-green-100',
      'INACTIVE': 'text-red-600 bg-red-100',
      'DRAFT': 'text-yellow-600 bg-yellow-100'
    }[status] || 'text-gray-600 bg-gray-100';
  }
  getTypeColor(type: JobOffer['jobType']): 
  string { switch (type) { 
    case 'FULL_TIME': return 'text-blue-600 bg-blue-100';
     case 'PART_TIME': return 'text-purple-600 bg-purple-100';
      case 'CONTRACT': return 'text-orange-600 bg-orange-100';
       case 'INTERNSHIP': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100'; } }

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
