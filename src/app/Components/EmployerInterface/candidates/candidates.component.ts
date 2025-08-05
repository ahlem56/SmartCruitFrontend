import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // ✅ import RouterModule
import { ApplicationService } from '../../../Services/application.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { Interview, InterviewService } from '../../../Services/interview.service';
import { SafeUrlPipe } from '../../../SafeUrlPipe';

interface User {
  userId: number;
}

interface Application {
  applicationId: number;
}

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
  imports: [CommonModule,FormsModule,HttpClientModule,RouterModule,SafeUrlPipe],
  standalone: true  

})

export class CandidatesComponent implements OnInit {
  jobOfferId: number = 0;
  candidates: any[] = [];
  jobTitle = '';
  searchTerm: string = '';
  selectedSkill: string = '';
  allSkills: string[] = [];
showInterviewModal = false;
selectedCandidate: any = null;
showScorePopup = false;
selectedScore: any = null;
cvPreviewUrl: string | null = null;
sortOption: string = 'scoreDesc';
selectedStatus: string = '';
selectedSort: string = 'score-desc';

currentPage = 1;
itemsPerPage = 10;

interviewForm = {
  proposedDate: '',
  location: '',
  notes: ''
};
  get filteredCandidates() {
    let filtered = this.candidates;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    }
    if (this.selectedSkill) {
      filtered = filtered.filter(c => c.skills && c.skills.includes(this.selectedSkill));
    }
    return filtered;
  }

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
      private interviewService: InterviewService // <-- ✅ Inject this

  ) {}

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchCandidates();
  }

  fetchCandidates(): void {
    this.applicationService.getApplicationsByJobOffer(this.jobOfferId).subscribe({
      next: (data) => {
        console.log('Raw applications:', data); // 👈 ADD THIS
        
       this.candidates = data.map(app => ({
  applicationId: app.applicationId,
  fullName: `${app.firstName ?? 'Unknown'} ${app.lastName ?? ''}`,
  userId: app.userId, // ✅ Directly from the root object
  email: app.email,
  phone: app.phone,
  experience: app.cv?.experience ?? 'N/A',
  skills: app.cv?.extractedSkills ?? [],
  matchingPercentage: app.matching?.score !== undefined ? Math.round(app.matching.score * 100) : 'N/A',
  matching: app.matching ?? null,
    profilePictureUrl: app.profilePicture, // ✅ FIXED
  cvUrl: app.cvUrl ?? null,
  status: app.applicationStatus // <-- 👈 Important
  
}));
console.log('Processed candidates:', this.candidates);

        this.jobTitle = data[0]?.jobOffer?.title ?? '';
        // Compute all unique skills
        const skillSet = new Set<string>();
        this.candidates.forEach(c => (c.skills || []).forEach((s: string) => skillSet.add(s)));
        this.allSkills = Array.from(skillSet).sort();
      },
      error: (err) => {
        console.error('Failed to fetch candidates', err);
        this.candidates = [];
        this.allSkills = [];
      }
    });
  }


 acceptApplication(applicationId: number) {
  console.log('➡️ Accept clicked with ID:', applicationId); // ← Add this
  if (!applicationId) return;

  this.applicationService.acceptApplication(applicationId).subscribe({
    next: (updatedApp) => {
      alert(`✅ Application accepted for: ${updatedApp.firstName} ${updatedApp.lastName}`);
      this.fetchCandidates(); // Refresh list
    },
    error: (err) => {
      console.error('❌ Failed to accept application', err);
      alert('❌ Failed to accept application. Please try again.');
    }
  });
}

rejectApplication(applicationId: number) {
  if (!applicationId) return;

  this.applicationService.rejectApplication(applicationId).subscribe({
    next: (updatedApp) => {
      alert(`❌ Application rejected for: ${updatedApp.firstName} ${updatedApp.lastName}`);
      this.fetchCandidates();
    },
    error: (err) => {
      console.error('❌ Failed to reject application', err);
      alert('❌ Failed to reject application. Please try again.');
    }
  });
}


openInterviewModal(candidate: any) {
  this.selectedCandidate = candidate;
  this.showInterviewModal = true;
}

closeInterviewModal() {
  this.showInterviewModal = false;
  this.selectedCandidate = null;
  this.interviewForm = {
    proposedDate: '',
    location: '',
    notes: ''
  };
}

submitInterview() {
  if (!this.selectedCandidate || !this.interviewForm.proposedDate) return;

  const employerId = JSON.parse(localStorage.getItem('currentUser')!).userId;

  const interviewData: Interview = {
    interviewId: 0, // Backend will auto-generate
    proposedDate: this.interviewForm.proposedDate,
confirmedDate: undefined,
    status: 'PENDING',
    location: this.interviewForm.location,
    notes: this.interviewForm.notes,
    employer: { userId: employerId } as User,       // Only ID is needed here
    candidate: { userId: this.selectedCandidate.userId } as User,
    application: { applicationId: this.selectedCandidate.applicationId } as Application
  };

  this.interviewService.proposeInterview(interviewData).subscribe({
    next: () => {
      alert('✅ Interview proposed successfully!');
      this.closeInterviewModal();
    },
    error: (err) => {
      console.error('Failed to schedule interview', err);
      alert('❌ Error scheduling interview');
    }
  });
}



getMatchLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Weak';
}

getMatchClass(score: number): string {
  if (score >= 80) return 'match-excellent';
  if (score >= 60) return 'match-good';
  if (score >= 40) return 'match-moderate';
  return 'match-weak';
}



showScoreDetails(candidate: any) {
  this.selectedScore = {
    matchingPercentage: candidate.matchingPercentage,
    missingSkills: candidate.matching?.feedback?.split(',').map((s: string) => s.trim()) || []
  };
  this.showScorePopup = true;
}

closeScorePopup() {
  this.showScorePopup = false;
  this.selectedScore = null;
}

previewCv(url: string) {
  this.cvPreviewUrl = url;
}

closeCvPreview() {
  this.cvPreviewUrl = null;
}
get processedCandidates() {
  let filtered = this.candidates;

  // Apply search
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      (c.fullName && c.fullName.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }

  // Apply skill filter
  if (this.selectedSkill) {
    filtered = filtered.filter(c => c.skills?.includes(this.selectedSkill));
  }

  // Apply status filter
  if (this.selectedStatus) {
    filtered = filtered.filter(c => c.status === this.selectedStatus);
  }

  // Apply sorting
  switch (this.selectedSort) {
    case 'score-asc':
      filtered = filtered.sort((a, b) => a.matchingPercentage - b.matchingPercentage);
      break;
    case 'score-desc':
      filtered = filtered.sort((a, b) => b.matchingPercentage - a.matchingPercentage);
      break;
    default:
      break;
  }

  return filtered;
}



get paginatedCandidates() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.processedCandidates.slice(start, start + this.itemsPerPage);
}

get totalPages() {
  return Math.ceil(this.processedCandidates.length / this.itemsPerPage);
}
}