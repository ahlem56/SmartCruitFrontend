import { Component, OnInit } from '@angular/core';
import { EmployerService } from '../../../Services/employer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employers',
  templateUrl: './employers.component.html',
  styleUrls: ['./employers.component.css'],
  imports: [CommonModule, FormsModule]
})
export class EmployersComponent implements OnInit {
  employers: any[] = [];
  filteredEmployers: any[] = [];
  selectedEmployer: any = null;
  showCreateForm = false;
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  
  // Search and filter properties
  searchTerm = '';
  industryFilter = '';
  statusFilter = '';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Statistics
  activeEmployersCount = 0;
  newEmployersThisMonth = 0;
  industries: string[] = [];
  
  // Math object for template
  Math = Math;
  
  newEmployer: any = {
    fullName: '',
    email: '',
    password: '',
    contact: '',
    industry: '',
    companyName: '',
    companyWebsite: ''
  };

  constructor(private employerService: EmployerService) {}

  ngOnInit(): void {
    this.loadEmployers();
  }

  loadEmployers() {
    this.isLoading = true;
    this.employerService.getAllEmployers().subscribe({
      next: (data) => {
        this.employers = data;
        this.filteredEmployers = [...data];
        this.calculateStatistics();
        this.extractIndustries();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employers:', err);
        this.isLoading = false;
        this.showError('Failed to load employers. Please refresh the page.');
      }
    });
  }

  calculateStatistics() {
    this.activeEmployersCount = this.employers.filter(emp => !emp.status || emp.status === 'active').length;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    this.newEmployersThisMonth = this.employers.filter(emp => {
      if (emp.createdAt) {
        const createdDate = new Date(emp.createdAt);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }
      return false;
    }).length;
  }

  extractIndustries() {
    const industrySet = new Set<string>();
    this.employers.forEach(emp => {
      if (emp.industry) {
        industrySet.add(emp.industry);
      }
    });
    this.industries = Array.from(industrySet).sort();
  }

  filterEmployers() {
    this.filteredEmployers = this.employers.filter(emp => {
      const matchesSearch = !this.searchTerm || 
        emp.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.companyName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.company?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesIndustry = !this.industryFilter || emp.industry === this.industryFilter;
      const matchesStatus = !this.statusFilter || emp.status === this.statusFilter;
      
      return matchesSearch && matchesIndustry && matchesStatus;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEmployers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  get paginatedEmployers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredEmployers.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  selectEmployer(employer: any) {
    this.selectedEmployer = { ...employer }; // clone for editing
  }

  createEmployer() {
    if (!this.validateEmployerForm(this.newEmployer)) {
      return;
    }

    this.isCreating = true;
    this.employerService.createEmployer(this.newEmployer).subscribe({
      next: () => {
        this.loadEmployers();
        this.showCreateForm = false;
        this.newEmployer = {
          fullName: '',
          email: '',
          password: '',
          contact: '',
          industry: '',
          companyName: '',
          companyWebsite: ''
        };
        this.isCreating = false;
        this.showSuccess('Employer created successfully!');
      },
      error: (err) => {
        console.error('Create failed:', err);
        this.isCreating = false;
        this.showError('Failed to create employer. Please try again.');
      }
    });
  }

  updateEmployer() {
    if (!this.selectedEmployer?.userId) return;

    if (!this.validateEmployerForm(this.selectedEmployer, false)) {
      return;
    }

    this.isUpdating = true;
    this.employerService.updateEmployer(this.selectedEmployer.userId, this.selectedEmployer).subscribe({
      next: () => {
        this.loadEmployers();
        this.selectedEmployer = null;
        this.isUpdating = false;
        this.showSuccess('Employer updated successfully!');
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.isUpdating = false;
        this.showError('Failed to update employer. Please try again.');
      }
    });
  }

  deleteEmployer(id: number) {
    if (confirm('Are you sure you want to delete this employer? This action cannot be undone.')) {
      this.isDeleting = true;
      this.employerService.deleteEmployer(id).subscribe({
        next: () => {
          this.loadEmployers();
          this.isDeleting = false;
          this.showSuccess('Employer deleted successfully!');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.isDeleting = false;
          this.showError('Failed to delete employer. Please try again.');
        }
      });
    }
  }

  cancelEdit() {
    this.selectedEmployer = null;
  }

  validateEmployerForm(employer: any, isCreate: boolean = true): boolean {
    if (!employer.fullName?.trim()) {
      this.showError('Full name is required.');
      return false;
    }
    
    if (!employer.email?.trim()) {
      this.showError('Email is required.');
      return false;
    }
    
    if (!this.isValidEmail(employer.email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }
    
    if (isCreate && !employer.password?.trim()) {
      this.showError('Password is required.');
      return false;
    }
    
    if (employer.password && employer.password.length < 6) {
      this.showError('Password must be at least 6 characters long.');
      return false;
    }
    
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showSuccess(message: string) {
    // You can implement a toast notification system here
    alert(message);
  }

  showError(message: string) {
    // You can implement a toast notification system here
    alert(message);
  }

  clearFilters() {
    this.searchTerm = '';
    this.industryFilter = '';
    this.statusFilter = '';
    this.filterEmployers();
  }
}
