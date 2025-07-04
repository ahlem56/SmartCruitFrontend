import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../Services/company.service';

@Component({
  selector: 'app-post-job-offers',
  standalone: true,
  templateUrl: './post-job-offers.component.html',
  styleUrls: ['./post-job-offers.component.css'],
  imports: [CommonModule, FormsModule],
})
export class PostJobOffersComponent {
  formData = {
    title: '',
    companyId: null as number | null,  // <-- add this instead of company name
    location: '',
    jobType: 'Full-time' as JobOffer['jobType'],
    requiredSkills: '',
    salary: 0,
    description: '',
    status: 'DRAFT' as JobOffer['status'],
    deadline: '',
    numberOfOpenPositions: 1,
    educationLevel: 'BACHELOR',   // Default
    experienceLevel: 'MID'        // Default
  };
  companies: { companyId: number, name: string }[] = [];

  

  constructor(private jobOffersService: JobOffersService, private router: Router, private companyService: CompanyService) {}

  ngOnInit(): void {
    this.companyService.getAllCompanies().subscribe((data) => {
      this.companies = data;
    });
  }
  createJobOffer(): void {
    const jobOfferPayload = {
      ...this.formData,
      requiredSkills: this.formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      jobType: this.formData.jobType,
      status: this.formData.status.toUpperCase() as JobOffer['status'] // ✅ FIX HERE
    };

    this.jobOffersService.addJobOffer(jobOfferPayload).subscribe(() => {
      this.router.navigate(['/employer/job-offers']);
    });
  }

  cancel(): void {
    this.router.navigate(['/employer/job-offers']);
  }
}
