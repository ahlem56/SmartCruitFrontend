import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // ✅ import RouterModule
import { ApplicationService } from '../../../Services/application.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
  imports: [CommonModule,FormsModule,HttpClientModule,RouterModule],
  standalone: true  

})
export class CandidatesComponent implements OnInit {
  jobOfferId: number = 0;
  candidates: any[] = [];
  jobTitle = '';
  searchTerm: string = '';
  selectedSkill: string = '';
  allSkills: string[] = [];

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
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchCandidates();
  }

  fetchCandidates(): void {
    this.applicationService.getApplicationsByJobOffer(this.jobOfferId).subscribe({
      next: (data) => {
        this.candidates = data.map(app => ({
          fullName: `${app.firstName ?? 'Unknown'} ${app.lastName ?? ''}`,
          email: app.email,
          phone: app.phone,
          experience: app.cv?.experience ?? 'N/A',
          skills: app.cv?.extractedSkills ?? [],
          matchingPercentage: app.matching?.score ? Math.round(app.matching.score * 100) : 'N/A',
          profilePicture: app.profilePicture,
          cvUrl: app.cv?.cvUrl
        }));
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
}
