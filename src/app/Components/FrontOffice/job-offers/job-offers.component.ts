// job-offers.component.ts (Frontoffice)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.css']
})
export class JobOffersComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  loading = true;
  error = false;
  searchTitle = '';
  searchLocation = '';
  jobTypes: JobOffer['jobType'][] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
  typeFilters: JobOffer['jobType'][] = [];
  salaryMin: number | null = null;
  salaryMax: number | null = null;

  experienceLevels: JobOffer['experienceLevel'][] = ['JUNIOR', 'MID', 'SENIOR'];
  educationLevels: JobOffer['educationLevel'][] = ['HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD'];

  experienceFilters: JobOffer['experienceLevel'][] = [];
  educationFilters: JobOffer['educationLevel'][] = [];

  // Track saved jobs
  savedJobs: Set<number> = new Set();

  constructor(private jobOffersService: JobOffersService, private router: Router) {}

  ngOnInit(): void {
    this.jobOffersService.getJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers.filter(o => o.status === 'ACTIVE');
        this.filteredOffers = [...this.jobOffers];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  onSearch(): void {
    const title = this.searchTitle.toLowerCase();
    const location = this.searchLocation.toLowerCase();
  
    this.filteredOffers = this.jobOffers.filter(o => {
      const matchTitle = o.title.toLowerCase().includes(title);
      const matchLocation = o.jobLocation.toLowerCase().includes(location);
      const matchType = this.typeFilters.length === 0 || this.typeFilters.includes(o.jobType);
      const matchSalaryMin = this.salaryMin == null || o.salary >= this.salaryMin;
      const matchSalaryMax = this.salaryMax == null || o.salary <= this.salaryMax;
      const matchExperience = this.experienceFilters.length === 0 || this.experienceFilters.includes(o.experienceLevel);
      const matchEducation = this.educationFilters.length === 0 || this.educationFilters.includes(o.educationLevel);
  
      return matchTitle && matchLocation && matchType && matchSalaryMin && matchSalaryMax && matchExperience && matchEducation;
    });
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

  goToJobDetails(id: number): void {
    this.router.navigate([`/job-details/${id}`], { queryParams: { apply: 'true' } });
  }

  toggleTypeFilter(type: JobOffer['jobType']) {
    this.typeFilters.includes(type)
      ? this.typeFilters = this.typeFilters.filter(t => t !== type)
      : this.typeFilters.push(type);
    this.onSearch();
  }
  
  toggleExperienceFilter(level: JobOffer['experienceLevel']) {
    this.experienceFilters.includes(level)
      ? this.experienceFilters = this.experienceFilters.filter(e => e !== level)
      : this.experienceFilters.push(level);
    this.onSearch();
  }
  
  toggleEducationFilter(level: JobOffer['educationLevel']) {
    this.educationFilters.includes(level)
      ? this.educationFilters = this.educationFilters.filter(e => e !== level)
      : this.educationFilters.push(level);
    this.onSearch();
  }

  // Clear all active filters
  clearAllFilters(): void {
    this.typeFilters = [];
    this.experienceFilters = [];
    this.educationFilters = [];
    this.salaryMin = null;
    this.salaryMax = null;
    this.searchTitle = '';
    this.searchLocation = '';
    this.onSearch();
  }

  // Check if there are any active filters
  hasActiveFilters(): boolean {
    return this.typeFilters.length > 0 || 
           this.experienceFilters.length > 0 || 
           this.educationFilters.length > 0 || 
           this.salaryMin !== null || 
           this.salaryMax !== null ||
           this.searchTitle !== '' ||
           this.searchLocation !== '';
  }

  // Get all active filters as strings for display
  getActiveFilters(): string[] {
    const filters: string[] = [];
    
    this.typeFilters.forEach(type => {
      filters.push(type.replace('_', ' '));
    });
    
    this.experienceFilters.forEach(exp => {
      filters.push(exp.replace('_', ' '));
    });
    
    this.educationFilters.forEach(edu => {
      filters.push(edu.replace('_', ' '));
    });
    
    if (this.salaryMin !== null) {
      filters.push(`Min $${this.salaryMin}`);
    }
    
    if (this.salaryMax !== null) {
      filters.push(`Max $${this.salaryMax}`);
    }
    
    if (this.searchTitle !== '') {
      filters.push(`"${this.searchTitle}"`);
    }
    
    if (this.searchLocation !== '') {
      filters.push(`📍 ${this.searchLocation}`);
    }
    
    return filters;
  }

  // Remove a specific filter
  removeFilter(filter: string): void {
    // Remove from type filters
    const typeFilter = this.jobTypes.find(type => type.replace('_', ' ') === filter);
    if (typeFilter && this.typeFilters.includes(typeFilter)) {
      this.typeFilters = this.typeFilters.filter(t => t !== typeFilter);
    }
    
    // Remove from experience filters
    const expFilter = this.experienceLevels.find(exp => exp.replace('_', ' ') === filter);
    if (expFilter && this.experienceFilters.includes(expFilter)) {
      this.experienceFilters = this.experienceFilters.filter(e => e !== expFilter);
    }
    
    // Remove from education filters
    const eduFilter = this.educationLevels.find(edu => edu.replace('_', ' ') === filter);
    if (eduFilter && this.educationFilters.includes(eduFilter)) {
      this.educationFilters = this.educationFilters.filter(e => e !== eduFilter);
    }
    
    // Remove salary filters
    if (filter.startsWith('Min $')) {
      this.salaryMin = null;
    }
    
    if (filter.startsWith('Max $')) {
      this.salaryMax = null;
    }
    
    // Remove search filters
    if (filter.startsWith('"') && filter.endsWith('"')) {
      this.searchTitle = '';
    }
    
    if (filter.startsWith('📍 ')) {
      this.searchLocation = '';
    }
    
    this.onSearch();
  }

  // Get time ago from date
  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInMs = now.getTime() - jobDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }

  // Check if job is saved
  isJobSaved(jobId: number): boolean {
    return this.savedJobs.has(jobId);
  }

  // Toggle job saved status
  toggleJobSaved(jobId: number): void {
    if (this.savedJobs.has(jobId)) {
      this.savedJobs.delete(jobId);
    } else {
      this.savedJobs.add(jobId);
    }
  }

  // Track by function for ngFor optimization
  trackByJobId(index: number, job: JobOffer): number {
    return job.jobOfferId;
  }
}
