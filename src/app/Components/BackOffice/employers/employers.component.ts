import { Component, OnInit } from '@angular/core';
import { EmployerService } from '../../../Services/employer.service';
import { CompanyService } from '../../../Services/company.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkWithHref } from '@angular/router';


@Component({
  selector: 'app-employers',
  templateUrl: './employers.component.html',
  styleUrls: ['./employers.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLinkWithHref]
})
export class EmployersComponent implements OnInit {
  employers: any[] = [];
  filteredEmployers: any[] = [];
  selectedEmployer: any = null;
  showCreateForm = false;

  // Loading and control states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;

  // Filters and search
  searchTerm = '';
  industryFilter = '';
  statusFilter = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Stats
  activeEmployersCount = 0;
  newEmployersThisMonth = 0;
  industries: string[] = [];
  companies: { companyId: number; name: string }[] = [];

  Math = Math; // for template math

  newEmployer: any = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthDate: '',
    linkedInUrl: '',
    githubUrl: '',
    industry: '',
    companyId: null,
  };

  constructor(
    private employerService: EmployerService,
    private companyService: CompanyService,
      private router: Router // ✅ Inject Router

  ) {}

  ngOnInit(): void {
    this.loadEmployers();
    this.loadCompanies();
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

  loadCompanies() {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => (this.companies = companies),
      error: (err) => console.error('Failed to load companies:', err),
    });
  }

  calculateStatistics() {
    this.activeEmployersCount = this.employers.filter(emp => !emp.status || emp.status === 'active').length;

    const now = new Date();
    this.newEmployersThisMonth = this.employers.filter(emp => {
      if (!emp.createdAt) return false;
      const date = new Date(emp.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }

  extractIndustries() {
    const unique = new Set<string>();
    this.employers.forEach(emp => emp.industry && unique.add(emp.industry));
    this.industries = Array.from(unique).sort();
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
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEmployers.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  selectEmployer(employer: any) {
    this.selectedEmployer = { ...employer };
  }

  cancelEdit() {
    this.selectedEmployer = null;
  }

  createEmployer() {
    if (!this.validateEmployerForm(this.newEmployer)) return;

    this.isCreating = true;

    this.employerService.createEmployer(this.newEmployer).subscribe({
      next: () => {
        this.loadEmployers();
        this.showCreateForm = false;
        this.resetNewEmployer();
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
    if (!this.validateEmployerForm(this.selectedEmployer, false)) return;

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
    if (!confirm('Are you sure you want to delete this employer?')) return;

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

  validateEmployerForm(employer: any, isCreate: boolean = true): boolean {
    if (!employer.fullName?.trim()) return this.error('Full name is required.');
    if (!employer.email?.trim()) return this.error('Email is required.');
    if (!this.isValidEmail(employer.email)) return this.error('Please enter a valid email address.');
    if (isCreate && !employer.password?.trim()) return this.error('Password is required.');
    if (employer.password && employer.password.length < 6) return this.error('Password must be at least 6 characters long.');
    return true;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  resetNewEmployer() {
    this.newEmployer = {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      birthDate: '',
      linkedInUrl: '',
      githubUrl: '',
      industry: '',
      companyId: null,
    };
  }

  clearFilters() {
    this.searchTerm = '';
    this.industryFilter = '';
    this.statusFilter = '';
    this.filterEmployers();
  }

  showSuccess(message: string) {
    alert(message); // You may replace with toast
  }

  showError(message: string) {
    alert(message); // You may replace with toast
  }

  private error(msg: string): false {
    this.showError(msg);
    return false;
  }
}
