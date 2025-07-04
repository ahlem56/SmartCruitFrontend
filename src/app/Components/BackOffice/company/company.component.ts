import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../Services/company.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent {
  companies: any[] = [];
  newCompany: any = {};
  selectedCompany: any = {};
  logoFile: File | null = null;
  logoPreviewUrl: string | null = null;
  showCompanyModal: boolean = false;
  isEditMode: boolean = false;
  searchTerm: string = '';
  showCompanyDetails: boolean = false;

  modalCompany: any = {};

  constructor(private companyService: CompanyService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  get filteredCompanies() {
    if (!this.searchTerm) return this.companies;
    const term = this.searchTerm.toLowerCase();
    return this.companies.filter(c =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.industry && c.industry.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))
    );
  }

  openCompanyModal(edit: boolean = false, company: any = null): void {
    this.isEditMode = edit;
    this.showCompanyModal = true;
    if (edit && company) {
      this.selectedCompany = { ...company };
      this.modalCompany = this.selectedCompany;
      this.logoPreviewUrl = company.logoUrl || null;
      this.logoFile = null;
    } else {
      this.newCompany = {};
      this.modalCompany = this.newCompany;
      this.logoPreviewUrl = null;
      this.logoFile = null;
    }
  }

  closeCompanyModal(): void {
    this.showCompanyModal = false;
    this.selectedCompany = {};
    this.newCompany = {};
    this.modalCompany = {};
    this.logoPreviewUrl = null;
    this.logoFile = null;
  }

  onLogoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogoFile(): void {
    this.logoFile = null;
    this.logoPreviewUrl = null;
    if (this.isEditMode) {
      this.selectedCompany.logoUrl = '';
    } else {
      this.newCompany.logoUrl = '';
    }
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => this.companies = data,
      error: (err) => console.error('Error loading companies:', err)
    });
  }

  createCompany(): void {
    const formData = new FormData();
  
    // ENVOI CORRECT de l'objet `company` sous forme JSON (clé : "company")
    formData.append(
      'company',
      new Blob([JSON.stringify(this.newCompany)], {
        type: 'application/json',
      })
    );
  
    // Envoi du logo si présent
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
  
    this.companyService.createCompany(formData).subscribe({
      next: () => {
        this.loadCompanies();
        this.closeCompanyModal();
      },
      error: (err) => console.error('Error creating company:', err),
    });
  }
  

  updateCompany(): void {
    const formData = new FormData();
  
    formData.append(
      'company',
      new Blob([JSON.stringify(this.selectedCompany)], {
        type: 'application/json',
      })
    );
  
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
  
    this.companyService.updateCompany(formData).subscribe({
      next: () => {
        this.loadCompanies();
        this.closeCompanyModal();
      },
      error: (err) => console.error('Error updating company:', err),
    });
  }
  

  deleteCompany(id: number): void {
    this.companyService.deleteCompany(id).subscribe({
      next: () => this.loadCompanies(),
      error: (err) => console.error('Error deleting company:', err)
    });
  }

  selectCompany(company: any): void {
    this.openCompanyModal(true, company);
  }


viewCompanyDetails(company: any): void {
  this.selectedCompany = company;
  this.showCompanyDetails = true;
}

closeDetailsModal(): void {
  this.showCompanyDetails = false;
  this.selectedCompany = {};
}

viewCompanyJobs(company: any): void {
  // TODO: Implement navigation to company jobs page
  console.log('Viewing jobs for company:', company.name);
  // You can implement navigation to a jobs page here
  // this.router.navigate(['/jobs'], { queryParams: { companyId: company.companyId } });
}

exportCompanyData(company: any): void {
  // Create a CSV export of company data
  const csvContent = this.generateCompanyCSV(company);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${company.name.replace(/[^a-zA-Z0-9]/g, '_')}_data.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

private generateCompanyCSV(company: any): string {
  const headers = ['Field', 'Value'];
  const data = [
    ['Company Name', company.name || ''],
    ['Industry', company.industry || ''],
    ['Description', company.description || ''],
    ['Email', company.contactEmail || ''],
    ['Phone', company.contactPhone || ''],
    ['Address', company.address || ''],
    ['Website', company.website || ''],
    ['LinkedIn', company.linkedInUrl || ''],
    ['Twitter', company.twitterUrl || ''],
    ['Facebook', company.facebookUrl || ''],
    ['Company ID', company.companyId || ''],
    ['Created At', company.createdAt || ''],
    ['Updated At', company.updatedAt || '']
  ];
  
  const csv = [headers, ...data]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csv;
}

}