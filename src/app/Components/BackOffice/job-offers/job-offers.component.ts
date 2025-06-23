import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';

@Component({
  selector: 'app-job-offers',
  imports: [CommonModule, FormsModule],
  templateUrl: './job-offers.component.html',
  styleUrl: './job-offers.component.css'
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

  // Form properties for adding/editing
  formData = {
    title: '',
    company: '',
    location: '',
    type: 'Full-time' as JobOffer['type'],
    salary: '',
    description: '',
    requirements: '',
    status: 'Draft' as JobOffer['status'],
    deadline: ''
  };

  constructor(private jobOffersService: JobOffersService) {}

  ngOnInit(): void {
    this.loadJobOffers();
  }

  loadJobOffers(): void {
    this.jobOffersService.getJobOffers().subscribe(offers => {
      this.jobOffers = offers;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredJobOffers = this.jobOffers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           offer.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           offer.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'All' || offer.status === this.statusFilter;
      const matchesType = this.typeFilter === 'All' || offer.type === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

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

  saveJobOffer(): void {
    if (this.isAdding) {
      this.createJobOffer();
    } else if (this.isEditing && this.selectedJobOffer) {
      this.updateJobOffer();
    }
  }

  private createJobOffer(): void {
    const newJobOffer = {
      ...this.formData,
      requirements: this.formData.requirements.split(',').map(req => req.trim()).filter(req => req),
      deadline: new Date(this.formData.deadline)
    };

    this.jobOffersService.addJobOffer(newJobOffer).subscribe(() => {
      this.loadJobOffers();
      this.cancelEdit();
    });
  }

  private updateJobOffer(): void {
    if (!this.selectedJobOffer) return;

    const updates = {
      ...this.formData,
      requirements: this.formData.requirements.split(',').map(req => req.trim()).filter(req => req),
      deadline: new Date(this.formData.deadline)
    };

    this.jobOffersService.updateJobOffer(this.selectedJobOffer.id, updates).subscribe(() => {
      this.loadJobOffers();
      this.cancelEdit();
    });
  }

  deleteJobOffer(id: number): void {
    if (confirm('Are you sure you want to delete this job offer?')) {
      this.jobOffersService.deleteJobOffer(id).subscribe(() => {
        this.loadJobOffers();
        if (this.selectedJobOffer?.id === id) {
          this.cancelEdit();
        }
      });
    }
  }

  updateStatus(id: number, status: JobOffer['status']): void {
    this.jobOffersService.updateJobOfferStatus(id, status).subscribe(() => {
      this.loadJobOffers();
    });
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
      company: jobOffer.company,
      location: jobOffer.location,
      type: jobOffer.type,
      salary: jobOffer.salary,
      description: jobOffer.description,
      requirements: jobOffer.requirements.join(', '),
      status: jobOffer.status,
      deadline: jobOffer.deadline.toISOString().split('T')[0]
    };
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: '',
      status: 'Draft',
      deadline: ''
    };
  }

  getStatusColor(status: JobOffer['status']): string {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Inactive': return 'text-red-600 bg-red-100';
      case 'Draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getTypeColor(type: JobOffer['type']): string {
    switch (type) {
      case 'Full-time': return 'text-blue-600 bg-blue-100';
      case 'Part-time': return 'text-purple-600 bg-purple-100';
      case 'Contract': return 'text-orange-600 bg-orange-100';
      case 'Internship': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}
