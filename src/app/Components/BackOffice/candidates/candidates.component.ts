import { Component, OnInit } from '@angular/core';
import { Candidate, CandidateService } from '../../../Services/candidate.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class CandidatesBackofficeComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  selectedCandidate: Candidate | null = null;
  isEditModalOpen = false;
  searchTerm: string = '';
  statusFilter: string = '';

  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void {
    this.fetchCandidates();
  }

  fetchCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: data => {
        this.candidates = data;
        this.filteredCandidates = [...data];
      },
      error: err => console.error('Failed to load candidates', err)
    });
  }

  filterCandidates(): void {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch = !this.searchTerm || 
        candidate.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.preferredJobTitle?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Default to active if isActive property doesn't exist
      const isActive = (candidate as any).isActive !== undefined ? (candidate as any).isActive : true;
      const matchesStatus = !this.statusFilter || 
        (this.statusFilter === 'active' && isActive) ||
        (this.statusFilter === 'inactive' && !isActive);
      
      return matchesSearch && matchesStatus;
    });
  }

  // Helper method to check if candidate is online (default to false)
  isCandidateOnline(candidate: Candidate): boolean {
    return (candidate as any).isOnline || false;
  }

  // Helper method to check if candidate is active (default to true)
  isCandidateActive(candidate: Candidate): boolean {
    return (candidate as any).isActive !== undefined ? (candidate as any).isActive : true;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filteredCandidates = [...this.candidates];
  }

  editCandidate(candidate: Candidate): void {
    this.selectedCandidate = { ...candidate }; // shallow clone
    this.isEditModalOpen = true;
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.selectedCandidate = null;
  }

  saveChanges(): void {
    if (!this.selectedCandidate) return;

    this.candidateService.updateCandidate(this.selectedCandidate.userId, this.selectedCandidate).subscribe({
      next: (updated) => {
        const index = this.candidates.findIndex(c => c.userId === updated.userId);
        if (index !== -1) {
          this.candidates[index] = updated;
          this.filterCandidates(); // Refresh filtered results
        }
        this.closeModal();
      },
      error: err => console.error('Error updating candidate', err)
    });
  }

  deleteCandidate(userId: number): void {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(userId).subscribe({
        next: () => {
          this.candidates = this.candidates.filter(c => c.userId !== userId);
          this.filterCandidates(); // Refresh filtered results
        },
        error: err => console.error('Failed to delete candidate', err)
      });
    }
  }
}
