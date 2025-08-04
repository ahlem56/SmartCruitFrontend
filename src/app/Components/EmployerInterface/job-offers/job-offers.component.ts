import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { CompanyService } from '../../../Services/company.service';
import { UserService } from '../../../Services/user.service';
import { FormErrorComponent } from '../../../Shared/form-error/form-error.component';

type FrontendJobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
type BackendJobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.css'],
  imports: [CommonModule, FormsModule, FormErrorComponent]
})
export class JobOffersEmployerInterfaceComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredJobOffers: JobOffer[] = [];

  selectedJobOffer: JobOffer | null = null;
  isEditing = false;
  isAdding = false;

  searchTerm = '';
  statusFilter = 'All';
  typeFilter = 'All';

  employerCompanyId: number | null = null;

  companies: { companyId: number; name?: string; logoUrl?: string }[] = [];

  formData = {
    title: '',
    description: '',
    salary: 0,
    jobLocation: '',
    requiredSkills: '',
    requiredLanguages: '',
    benefits: '',
    educationLevel: 'BACHELOR',
    experienceLevel: 'MID',
    jobType: 'Full-time' as FrontendJobType,
    numberOfOpenPositions: 1,
    deadline: '',
    status: 'DRAFT' as JobOffer['status'],
    category: 'TECHNOLOGY' as JobOffer['category']
  };

  constructor(
    private jobOffersService: JobOffersService,
    private router: Router,
    private companyService: CompanyService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.employerCompanyId = profile?.company?.companyId || null;
        this.loadJobOffers();
      },
      error: (err) => console.error('❌ Failed to load employer profile:', err)
    });
  }

  loadJobOffers(): void {
    this.jobOffersService.getJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers.filter(
          offer => offer.company?.companyId === this.employerCompanyId
        );
        this.applyFilters();
      },
      error: (err) => console.error('❌ Failed to load job offers:', err)
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.toLowerCase();

    this.filteredJobOffers = this.jobOffers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(search)
        || offer.jobLocation.toLowerCase().includes(search);

      const matchesStatus = this.statusFilter === 'All'
        || offer.status === this.statusFilter.toUpperCase();

      const matchesType = this.typeFilter === 'All'
        || offer.jobType === this.mapToBackendJobType(this.typeFilter as FrontendJobType);

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  onSearchChange(): void { this.applyFilters(); }
  onStatusFilterChange(): void { this.applyFilters(); }
  onTypeFilterChange(): void { this.applyFilters(); }

  addNewJobOffer(): void {
    this.resetForm();
    this.selectedJobOffer = null;
    this.isAdding = true;
    this.isEditing = false;
  }

  editJobOffer(job: JobOffer): void {
    this.populateForm(job);
    this.selectedJobOffer = job;
    this.isEditing = true;
    this.isAdding = false;
  }

  viewJobOffer(job: JobOffer): void {
    this.populateForm(job);
    this.selectedJobOffer = job;
    this.isEditing = false;
    this.isAdding = false;
  }

  cancelEdit(): void {
    this.resetForm();
    this.selectedJobOffer = null;
    this.isEditing = false;
    this.isAdding = false;
  }

  saveJobOffer(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach(ctrl => ctrl.markAsTouched());
      return;
    }

    this.isAdding ? this.createJobOffer() : this.updateJobOffer();
  }

  private createJobOffer(): void {
    const user = this.userService.getCurrentUser();

    if (!user || user.role !== 'employer' || !this.employerCompanyId) {
      alert('Invalid employer. Please check your profile.');
      return;
    }

    const payload = this.buildPayload(user.userId);

    this.jobOffersService.addJobOffer(payload).subscribe({
      next: () => {
        this.loadJobOffers();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('❌ Error creating job offer:', err);
        alert('Failed to create job offer.');
      }
    });
  }

  private updateJobOffer(): void {
    if (!this.selectedJobOffer) return;

    const user = this.userService.getCurrentUser();
    if (!user) {
      console.error('❌ User is null');
      return;
    }

    const payload = this.buildPayload(user.userId);

    this.jobOffersService.updateJobOffer(this.selectedJobOffer.jobOfferId, payload).subscribe({
      next: () => {
        this.loadJobOffers();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('❌ Error updating job offer:', err);
        alert('Failed to update job offer.');
      }
    });
  }

  deleteJobOffer(id: number): void {
    if (!confirm('Are you sure you want to delete this job offer?')) return;

    this.jobOffersService.deleteJobOffer(id).subscribe(() => {
      this.loadJobOffers();
      if (this.selectedJobOffer?.jobOfferId === id) this.cancelEdit();
    });
  }

  private buildPayload(userId: number): Partial<JobOffer> {
    const categoryValue = (this.formData.category || 'TECHNOLOGY') as JobOffer['category'];
  
    const payload: Partial<JobOffer> = {
      title: this.formData.title,
      description: this.formData.description,
      salary: this.formData.salary,
      jobLocation: this.formData.jobLocation,
      requiredSkills: this.formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      requiredLanguages: this.formData.requiredLanguages.split(',').map(l => l.trim()).filter(Boolean),
      benefits: this.formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
      educationLevel: this.formData.educationLevel,
      experienceLevel: this.formData.experienceLevel,
      jobType: this.mapToBackendJobType(this.formData.jobType),
      numberOfOpenPositions: this.formData.numberOfOpenPositions,
      deadline: this.formData.deadline,
      status: this.formData.status.toUpperCase() as JobOffer['status'],
      category: categoryValue, // ✅ explicitly cast
      employer: { userId },
      company: { companyId: this.employerCompanyId! }
    };
  
    console.log('✅ Payload being sent to backend:', payload);
  
    return payload;
  }
  

  private populateForm(offer: JobOffer): void {
    this.formData = {
      title: offer.title,
      description: offer.description,
      salary: offer.salary,
      jobLocation: offer.jobLocation,
      requiredSkills: offer.requiredSkills.join(', '),
      requiredLanguages: offer.requiredLanguages?.join(', ') ?? '',
      benefits: offer.benefits?.join(', ') ?? '',
      educationLevel: offer.educationLevel,
      experienceLevel: offer.experienceLevel,
      jobType: this.mapFromBackendJobType(offer.jobType),
      numberOfOpenPositions: offer.numberOfOpenPositions,
      deadline: offer.deadline.split('T')[0],
      status: offer.status,
      category: offer.category as JobOffer['category']
    };
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      salary: 0,
      jobLocation: '',
      requiredSkills: '',
      requiredLanguages: '',
      benefits: '',
      educationLevel: 'BACHELOR',
      experienceLevel: 'MID',
      jobType: 'Full-time',
      numberOfOpenPositions: 1,
      deadline: '',
      status: 'DRAFT',
      category: 'TECHNOLOGY'
    };
  }

  mapToBackendJobType(type: FrontendJobType): BackendJobType {
    const mapping: Record<FrontendJobType, BackendJobType> = {
      'Full-time': 'FULL_TIME',
      'Part-time': 'PART_TIME',
      'Contract': 'CONTRACT',
      'Internship': 'INTERNSHIP',
      'Remote': 'REMOTE'
    };
    return mapping[type];
  }
  
  mapFromBackendJobType(type: BackendJobType): FrontendJobType {
    const mapping: Record<BackendJobType, FrontendJobType> = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'CONTRACT': 'Contract',
      'INTERNSHIP': 'Internship',
      'REMOTE': 'Remote'
    };
    return mapping[type];
  }
  

  getStatusColor(status: JobOffer['status']): string {
    return {
      'ACTIVE': 'text-green-600 bg-green-100',
      'INACTIVE': 'text-red-600 bg-red-100',
      'DRAFT': 'text-yellow-600 bg-yellow-100'
    }[status] || 'text-gray-600 bg-gray-100';
  }

  getTypeColor(type: JobOffer['jobType']): string {
    return {
      'FULL_TIME': 'text-blue-600 bg-blue-100',
      'PART_TIME': 'text-purple-600 bg-purple-100',
      'CONTRACT': 'text-orange-600 bg-orange-100',
      'INTERNSHIP': 'text-green-600 bg-green-100',
      'REMOTE': 'text-red-600 bg-red-100'
    }[type] || 'text-gray-600 bg-gray-100';
  }

  viewCandidates(jobOfferId: number): void {
    this.router.navigate([`/employer/job-offers/${jobOfferId}/candidates`]);
  }
}
