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
  isSubmitting = false;

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
    if (!this.validateForm() || !this.jobOffer || this.isSubmitting) return;
  
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.userId) {
      Swal.fire({
        icon: 'info',
        title: 'Sign in required',
        text: 'You must be logged in to apply.',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    this.isSubmitting = true;
  
    const { userId } = currentUser;
    const jobOfferId = this.jobOffer.jobOfferId;
    const cvFile = this.applicationForm.cvFile!;
  
    this.applicationService.applyToJob(userId, jobOfferId, cvFile, { ...this.applicationForm }).subscribe({
      next: (res) => {
        this.closeApplicationModal();
        this.showSuccessModal(res);
  
        // ✅ Analytics: submission tracked
        try {
          gtag('event', 'application_submitted', {
            job_id: jobOfferId,
            user_id: userId,
            score: this.formatPercent(res?.score),
          });
        } catch (_) {}
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Submission failed',
          html: `<p class="sc-muted">We couldn’t send your application right now. Please try again in a moment.</p>`,
          confirmButtonText: 'Try again'
        });
      }
    });
  }
  

  private getCopy(tone: 'professional'|'friendly'|'playful' = 'professional') {
    switch (tone) {
      case 'friendly':
        return {
          title: 'Application sent 🎉',
          scoreLabel: 'Match score',
          missingTitle: 'Things to brush up on',
          jobsTitle: 'Jobs you might like',
          coursesTitle: 'Courses worth a peek',
          confirm: 'Awesome',
          deny: 'See more jobs'
        };
      case 'playful':
        return {
          title: 'Boom! Application away 🚀',
          scoreLabel: 'Match-o-meter',
          missingTitle: 'Level‑up targets',
          jobsTitle: 'Hot picks for you',
          coursesTitle: 'Quick skill boosts',
          confirm: 'Nice!',
          deny: 'Browse more'
        };
      default: // professional
        return {
          title: 'Application submitted',
          scoreLabel: 'Match score',
          missingTitle: 'Missing skills',
          jobsTitle: 'Recommended roles',
          coursesTitle: 'Recommended courses',
          confirm: 'Done',
          deny: 'Explore more jobs'
        };
    }
  }
  

  showSuccessModal(response: any): void {
    const score = this.formatPercent(response?.score);
    const missingSkills: string[] = response?.missingSkills || [];
    const suggestedJobs: any[] = response?.suggestedJobs || [];
    const suggestedCourses: any[] = response?.suggestedCourses || [];
  
    // ⬅️ choose your tone here
    const copy = this.getCopy('professional');
  
    const skillsBlock = missingSkills.length
      ? `<div class="sc-chip-row">${this.chipify(missingSkills)}</div>`
      : `<p class="sc-success">You meet all the job requirements.</p>`;
  
    const jobsBlock = `
      <h3 class="sc-section-title">${copy.jobsTitle}</h3>
      ${this.jobCards(suggestedJobs)}
    `;
    const coursesBlock = suggestedCourses.length
      ? `<h3 class="sc-section-title">${copy.coursesTitle}</h3>${this.courseCards(suggestedCourses)}`
      : '';
  
    Swal.fire({
      title: copy.title,
      html: `
        <div class="sc-modal sc-typo">
          <section class="sc-score sc-score--center">
            ${scoreMeter(score)}
            <div class="sc-score-caption">
              <span class="sc-score-label">${copy.scoreLabel}</span>
            </div>
          </section>
  
          <section>
            <h3 class="sc-section-title">${copy.missingTitle}</h3>
            ${skillsBlock}
          </section>
  
          <section>${jobsBlock}</section>
          ${coursesBlock ? `<section>${coursesBlock}</section>` : ''}
        </div>
      `,
      icon: 'success',
      focusConfirm: false,
      confirmButtonText: copy.confirm,
      showDenyButton: true,
      denyButtonText: copy.deny,
      showCloseButton: true,
      customClass: {
        popup: 'swal2-rounded sc-swal',
        title: 'sc-title',
        confirmButton: 'btn-primary',
        denyButton: 'btn-secondary'
      },
      didOpen: () => {
        const v = document.querySelector('.sc-meter-value') as SVGTextElement | null;
        if (v) v.style.opacity = '1';
      }
    }).then(res => {
      if (res.isDenied) this.router.navigate(['/job-offers']);
    });
  
    function scoreMeter(val: number): string {
      const size = 128, stroke = 10, r = (size - stroke) / 2;
      const c = 2 * Math.PI * r, offset = c * (1 - val / 100);
      const color = val >= 75 ? '#16a34a' : val >= 50 ? '#f59e0b' : '#ef4444';
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="sc-meter" role="img" aria-label="${val}%">
          <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="#e9eef5" stroke-width="${stroke}" fill="none" />
          <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none"
                  stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
                  transform="rotate(-90 ${size/2} ${size/2})"/>
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
                class="sc-meter-value">${val}%</text>
        </svg>`;
    }
  }
  private validateForm(): boolean {
    const { firstName, lastName, email, phone, coverLetter, cvFile } = this.applicationForm;
  
    const fail = (msg: string) => {
      Swal.fire({ icon: 'warning', title: 'Incomplete form', text: msg, confirmButtonText: 'OK' });
      return false;
    };
  
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim() || !cvFile) {
      return fail('Please complete all fields and upload your CV.');
    }
    if (!this.isValidEmail(email)) {
      return fail('Please enter a valid email address.');
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

  private formatPercent(x: number | undefined | null): number {
    const v = Math.round(((x ?? 0) as number) * 100);
    return Math.max(0, Math.min(100, v));
  }
  
  private chipify(list: string[]): string {
    return list.map(s => `<span class="sc-chip" title="${s}">${s}</span>`).join('');
  }
  
  private jobCards(jobs: any[]): string {
    if (!jobs || !jobs.length) return `<p class="sc-muted">No matching jobs found.</p>`;
    return `
      <div class="sc-card-grid">
        ${jobs.slice(0, 3).map(job => `
          <a href="/job-details/${job.jobId}" class="sc-card" target="_blank" rel="noopener">
            <div class="sc-card-media">
              <img src="${job.logoUrl || 'assets/FrontOffice/images/default-company.png'}" alt="${job.company || 'Company'} logo" loading="lazy" />
            </div>
            <div class="sc-card-body">
              <div class="sc-card-title">${job.title || 'Job'}</div>
              <div class="sc-card-subtitle">${job.company || ''} ${job.location ? `• ${job.location}` : ''}</div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }
  
 // Put these helpers with your other privates
private clamp(text: any, max = 90): string {
  const s = (text ?? '').toString().trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
private safeSkill(s: any): string {
  const t = (s ?? '').toString().trim();
  return t || 'General';
}

private courseCards(courses: any[]): string {
  if (!courses?.length) return '';
  return `
    <div class="sc-course-grid">
      ${courses.slice(0, 6).map(c => {
        const title = this.clamp(c?.title || 'Course');
        const skill = this.safeSkill(c?.skill);
        const v = (c?.videoId || '').toString().trim();
        const thumb = v ? `https://img.youtube.com/vi/${v}/hqdefault.jpg` : 'assets/FrontOffice/images/course-fallback.jpg';
        const url = c?.url || (v ? `https://www.youtube.com/watch?v=${v}` : '#');
        return `
          <a href="${url}" class="sc-course-card" target="_blank" rel="noopener">
            <div class="sc-course-thumb">
              <img src="${thumb}" alt="${title} thumbnail" loading="lazy" />
            </div>
            <div class="sc-course-body">
              <div class="sc-course-title">${title}</div>
              <div class="sc-course-sub">Skill: ${skill}</div>
            </div>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

}