import { Component, OnInit } from '@angular/core';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service'; // adjust path if needed
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../Services/application.service';

@Component({
  selector: 'app-job-offers-backoffice',
  templateUrl: './job-offers-backoffice.component.html',
  styleUrls: ['./job-offers-backoffice.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class JobOffersBackofficeComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  isLoading = false;
  errorMessage = '';
  applicationsForSelectedJob: any[] = [];
  showApplicationsModal = false;
  
  // UI state for filtering and modal
  searchTerm: string = '';
  statusFilter: string = '';
  categoryFilter: string = '';
  showJobOfferDetails: boolean = false;
  selectedJobOffer: JobOffer | null = null;

  get filteredJobOffers(): JobOffer[] {
    return this.jobOffers.filter(offer => {
      const matchesSearch =
        !this.searchTerm ||
        offer.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.company?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || offer.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || offer.category === this.categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  viewJobOfferDetails(offer: JobOffer): void {
    this.selectedJobOffer = offer;
    this.showJobOfferDetails = true;
  }

  closeJobOfferDetails(): void {
    this.showJobOfferDetails = false;
    this.selectedJobOffer = null;
  }

  constructor(private jobOffersService: JobOffersService,  private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.fetchJobOffers();
  }

  fetchJobOffers(): void {
    this.isLoading = true;
    this.jobOffersService.getJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading job offers:', err);
        this.errorMessage = 'Failed to load job offers.';
        this.isLoading = false;
      }
    });
  }

  deleteJobOffer(id: number): void {
    if (!confirm('Are you sure you want to delete this job offer?')) return;

    this.jobOffersService.deleteJobOffer(id).subscribe({
      next: () => {
        this.jobOffers = this.jobOffers.filter(o => o.jobOfferId !== id);
        alert('Job offer deleted successfully.');
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete job offer.');
      }
    });
  }

  viewApplicationsForJob(offer: JobOffer): void {
    this.selectedJobOffer = offer;
    this.applicationService.getApplicationsByJobOffer(offer.jobOfferId).subscribe({
      next: (apps) => {
        this.applicationsForSelectedJob = apps;
        this.showApplicationsModal = true;
      },
      error: (err) => {
        console.error('Failed to load applications:', err);
        alert('Failed to load applications for this job.');
      }
    });
  }
  
  closeApplicationsModal(): void {
    this.showApplicationsModal = false;
    this.applicationsForSelectedJob = [];
  }
  
}
