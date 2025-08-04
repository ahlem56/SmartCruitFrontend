import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { DashboardService, AdminDashboardStats, UserRankDto, CompanyRankDto } from '../../../Services/dashboard.service';
import { ApplicationService } from '../../../Services/application.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  // Data Models
  jobOffers: JobOffer[] = [];
  topJobOffers: JobOffer[] = [];
  recentApplications: any[] = [];
  activityTimeline: any[] = [];
  topCandidates: UserRankDto[] = [];
  topEmployers: UserRankDto[] = [];
  topCompanies: CompanyRankDto[] = [];
  

  // Stats
  totalOffers = 0;
  activeOffers = 0;
  totalApplications = 0;
  profileCompletion = 75;

  // Chart: Applications Over Time
  applicationsLineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  applicationsLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  // Chart: Offer Status Doughnut
  statusDoughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active', 'Draft', 'Inactive'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#007bff', '#ffc107', '#ff4d4f'],
      borderWidth: 2
    }]
  };
  statusDoughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '70%',
    plugins: { legend: { position: 'bottom' } }
  };

  // Chart: Top Offers Bar
  topOffersBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Applications',
      backgroundColor: '#007bff',
      borderRadius: 8
    }]
  };
  topOffersBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#e3f0ff' } }
    }
  };

  constructor(
    private jobOffersService: JobOffersService,
    private dashboardService: DashboardService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadJobOffersAndApplications();
    this.loadEngagementStats();
  }

  loadDashboardStats(): void {
    this.dashboardService.getOverview().subscribe((stats: AdminDashboardStats) => {
      this.totalOffers = stats.totalJobs;
      this.activeOffers = stats.activeJobs;
      this.totalApplications = stats.totalApplications;

      this.applicationsLineChartData = {
        labels: ['Last 30d', 'Last 7d', 'Last 24h'],
        datasets: [{
          data: [
            stats.newApplications30d || 0,
            stats.newApplications7d || 0,
            stats.newApplications24h || 0
          ],
          label: 'Applications',
          fill: true,
          tension: 0.4,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0,123,255,0.15)',
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointRadius: 5
        }]
      };
    });
  }

  loadJobOffersAndApplications(): void {
    this.jobOffersService.getJobOffers().subscribe(offers => {
      this.jobOffers = offers;

      // Top 3 Offers by Applications
      this.topJobOffers = [...offers]
        .sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0))
        .slice(0, 3);

      this.topOffersBarChartData = {
        labels: this.topJobOffers.map(o => o.title),
        datasets: [{
          data: this.topJobOffers.map(o => o.applicationsCount || 0),
          label: 'Applications',
          backgroundColor: '#007bff',
          borderRadius: 8
        }]
      };

      // Job Offer Status Chart
      const active = offers.filter(o => o.status === 'ACTIVE').length;
      const draft = offers.filter(o => o.status === 'DRAFT').length;
      const inactive = offers.filter(o => o.status === 'INACTIVE').length;

      this.statusDoughnutChartData = {
        labels: ['Active', 'Draft', 'Inactive'],
        datasets: [{
          data: [active, draft, inactive],
          backgroundColor: ['#007bff', '#ffc107', '#ff4d4f'],
          borderWidth: 2
        }]
      };

      // Timeline (recent 3 offers)
      this.activityTimeline = offers.slice(0, 3).map(o => ({
        icon: '📝',
        action: `Posted "${o.title}"`,
        date: o.postedDate
      }));

      this.loadRecentApplications(offers);
    });
  }

  async loadRecentApplications(offers: JobOffer[]): Promise<void> {
    const applicationFetches = offers.map(async offer => {
      try {
        const apps = await this.applicationService
          .getApplicationsByJobOffer(offer.jobOfferId)
          .toPromise();

        return (apps ?? []).map(app => ({
          applicant: `${app.firstName} ${app.lastName}`,
          jobTitle: offer.title,
          date: app.appliedAt,
          status: app.applicationStatus
        }));
      } catch (err) {
        console.error(`Error fetching applications for job ${offer.jobOfferId}:`, err);
        return [];
      }
    });

    const allResults = await Promise.all(applicationFetches);
    this.recentApplications = allResults
      .flat()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  loadEngagementStats(): void {
    this.dashboardService.getEngagementStats().subscribe(stats => {
      this.topCandidates = stats.topCandidates;
      this.topEmployers = stats.topEmployers;
      this.topCompanies = stats.topCompanies; // [{ name, logoUrl }]
    });
  }
}
