import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { CompanyService } from '../../../Services/company.service';
import { FormErrorComponent } from '../../../Shared/form-error/form-error.component';

type FrontendJobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
type BackendJobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, FormErrorComponent],
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.css']
})
export class JobOffersBackofficeComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredJobOffers: JobOffer[] = [];
  selectedJobOffer: JobOffer | null = null;
  isEditing = false;
  isAdding = false;
  searchTerm = '';
  statusFilter = 'All';
  typeFilter = 'All';
  companies: { companyId: number, name?: string }[] = [];

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
    companyId: 0
  };

  constructor(
    private jobOffersService: JobOffersService,
    private router: Router,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadJobOffers();
    this.loadCompanies();
  }

  loadJobOffers(): void {
    this.jobOffersService.getJobOffers().subscribe((offers) => {
      this.jobOffers = offers;
      this.applyFilters();
    });
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => this.companies = companies,
      error: (err) => console.error('Failed to load companies:', err)
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredJobOffers = this.jobOffers.filter((offer) => {
      return (
        (offer.title.toLowerCase().includes(search) ||
         offer.jobLocation.toLowerCase().includes(search)) &&
        (this.statusFilter === 'All' || offer.status === this.statusFilter.toUpperCase()) &&
        (this.typeFilter === 'All' || offer.jobType === this.mapToBackendJobType(this.typeFilter as FrontendJobType))
      );
    });
  }

  onSearchChange(): void { this.applyFilters(); }
  onStatusFilterChange(): void { this.applyFilters(); }
  onTypeFilterChange(): void { this.applyFilters(); }

  addNewJobOffer(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedJobOffer = null;
    this.resetForm();
  }

  editJobOffer(jobOffer: JobOffer): void {
    this.selectedJobOffer = jobOffer;
    this.isEditing = true;
    this.isAdding = false;
    this.populateForm(jobOffer);
  }

  viewJobOffer(jobOffer: JobOffer): void {
    this.selectedJobOffer = jobOffer;
    this.isEditing = false;
    this.isAdding = false;
    this.populateForm(jobOffer);
  }

  saveJobOffer(form: NgForm): void {
    if (form.invalid) {
      // Mark all controls as touched to trigger validation messages
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
  
    if (this.isAdding) {
      this.createJobOffer();
    } else if (this.isEditing && this.selectedJobOffer) {
      this.updateJobOffer();
    }
  }

  private createJobOffer(): void {
    const selectedCompany = this.companies.find(c => c.companyId === this.formData.companyId);
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
      employer: { userId: 10 },
      company: selectedCompany ? { companyId: selectedCompany.companyId } : null
    };

    this.jobOffersService.addJobOffer(payload).subscribe({
      next: () => {
        this.loadJobOffers();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to create job offer:', err);
        alert('Failed to create job offer. Check console for details.');
      }
    });
  }

  private updateJobOffer(): void {
    if (!this.selectedJobOffer) return;

    const selectedCompany = this.companies.find(c => c.companyId === this.formData.companyId);
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
      employer: { userId: 10 },
      company: selectedCompany ? { companyId: selectedCompany.companyId } : null
    };

    this.jobOffersService.updateJobOffer(this.selectedJobOffer.jobOfferId, payload).subscribe(() => {
      this.loadJobOffers();
      this.cancelEdit();
    });
  }

  deleteJobOffer(id: number): void {
    if (confirm('Are you sure you want to delete this job offer?')) {
      this.jobOffersService.deleteJobOffer(id).subscribe(() => {
        this.loadJobOffers();
        if (this.selectedJobOffer?.jobOfferId === id) {
          this.cancelEdit();
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isAdding = false;
    this.selectedJobOffer = null;
    this.resetForm();
  }

  private populateForm(jobOffer: JobOffer): void {
    this.formData = {
      title: jobOffer.title,
      description: jobOffer.description,
      salary: jobOffer.salary,
      jobLocation: jobOffer.jobLocation,
      requiredSkills: jobOffer.requiredSkills.join(', '),
      requiredLanguages: jobOffer.requiredLanguages?.join(', ') ?? '',
      benefits: jobOffer.benefits?.join(', ') ?? '',
      educationLevel: jobOffer.educationLevel,
      experienceLevel: jobOffer.experienceLevel,
      jobType: this.mapFromBackendJobType(jobOffer.jobType),
      numberOfOpenPositions: jobOffer.numberOfOpenPositions,
      deadline: jobOffer.deadline.split('T')[0],
      status: jobOffer.status,
      companyId: jobOffer.company?.companyId ?? 0
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
      companyId: 0
    };
  }

  private mapToBackendJobType(type: FrontendJobType): BackendJobType {
    switch (type) {
      case 'Full-time': return 'FULL_TIME';
      case 'Part-time': return 'PART_TIME';
      case 'Contract': return 'CONTRACT';
      case 'Internship': return 'INTERNSHIP';
      default: return 'FULL_TIME';
    }
  }

  private mapFromBackendJobType(type: BackendJobType): FrontendJobType {
    switch (type) {
      case 'FULL_TIME': return 'Full-time';
      case 'PART_TIME': return 'Part-time';
      case 'CONTRACT': return 'Contract';
      case 'INTERNSHIP': return 'Internship';
      default: return 'Full-time';
    }
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

  viewCandidates(jobOfferId: number): void {
    this.router.navigate([`/employer/job-offers/${jobOfferId}/candidates`]);
  }
}
