import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary: string;
  description: string;
  requirements: string[];
  status: 'Active' | 'Inactive' | 'Draft';
  postedDate: Date;
  deadline: Date;
  applicationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class JobOffersService {
  private jobOffers: JobOffer[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      description: 'We are looking for an experienced Frontend Developer to join our team and help build amazing user experiences.',
      requirements: ['Angular', 'TypeScript', 'HTML/CSS', '5+ years experience'],
      status: 'Active',
      postedDate: new Date('2024-01-15'),
      deadline: new Date('2024-03-15'),
      applicationsCount: 25
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      location: 'Remote',
      type: 'Contract',
      salary: '$60,000 - $90,000',
      description: 'Creative UX/UI Designer needed to design intuitive and beautiful user interfaces.',
      requirements: ['Figma', 'Adobe Creative Suite', 'User Research', '3+ years experience'],
      status: 'Active',
      postedDate: new Date('2024-01-20'),
      deadline: new Date('2024-03-20'),
      applicationsCount: 18
    },
    {
      id: 3,
      title: 'Backend Developer',
      company: 'DataTech',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$90,000 - $130,000',
      description: 'Backend developer position focusing on scalable architecture and database design.',
      requirements: ['Node.js', 'Python', 'PostgreSQL', 'AWS', '4+ years experience'],
      status: 'Draft',
      postedDate: new Date('2024-01-25'),
      deadline: new Date('2024-03-25'),
      applicationsCount: 0
    },
    {
      id: 4,
      title: 'Marketing Intern',
      company: 'GrowthCo',
      location: 'Chicago, IL',
      type: 'Internship',
      salary: '$25/hour',
      description: 'Marketing internship opportunity for students interested in digital marketing and growth strategies.',
      requirements: ['Marketing degree', 'Social media experience', 'Analytics tools'],
      status: 'Inactive',
      postedDate: new Date('2024-01-10'),
      deadline: new Date('2024-02-10'),
      applicationsCount: 45
    }
  ];

  constructor() { }

  getJobOffers(): Observable<JobOffer[]> {
    return of(this.jobOffers);
  }

  getJobOfferById(id: number): Observable<JobOffer | undefined> {
    const jobOffer = this.jobOffers.find(offer => offer.id === id);
    return of(jobOffer);
  }

  addJobOffer(jobOffer: Omit<JobOffer, 'id' | 'postedDate' | 'applicationsCount'>): Observable<JobOffer> {
    const newJobOffer: JobOffer = {
      ...jobOffer,
      id: Math.max(...this.jobOffers.map(offer => offer.id)) + 1,
      postedDate: new Date(),
      applicationsCount: 0
    };
    this.jobOffers.push(newJobOffer);
    return of(newJobOffer);
  }

  updateJobOffer(id: number, updates: Partial<JobOffer>): Observable<JobOffer | undefined> {
    const index = this.jobOffers.findIndex(offer => offer.id === id);
    if (index !== -1) {
      this.jobOffers[index] = { ...this.jobOffers[index], ...updates };
      return of(this.jobOffers[index]);
    }
    return of(undefined);
  }

  deleteJobOffer(id: number): Observable<boolean> {
    const index = this.jobOffers.findIndex(offer => offer.id === id);
    if (index !== -1) {
      this.jobOffers.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  updateJobOfferStatus(id: number, status: JobOffer['status']): Observable<JobOffer | undefined> {
    return this.updateJobOffer(id, { status });
  }
} 