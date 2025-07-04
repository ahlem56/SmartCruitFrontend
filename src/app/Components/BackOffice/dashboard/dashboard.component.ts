import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartConfiguration } from 'chart.js';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  totalOffers = 0;
  activeOffers = 0;
  totalApplications = 0;
  topJobOffers: JobOffer[] = [];

  recentApplications = [
    { applicant: 'Alice Smith', jobTitle: 'Senior Frontend Developer', date: new Date('2024-03-01'), status: 'New' },
    { applicant: 'Bob Johnson', jobTitle: 'UX/UI Designer', date: new Date('2024-03-02'), status: 'Reviewed' },
    { applicant: 'Charlie Lee', jobTitle: 'Backend Developer', date: new Date('2024-03-03'), status: 'Interview' },
    { applicant: 'Dana White', jobTitle: 'Marketing Intern', date: new Date('2024-03-04'), status: 'Rejected' },
  ];

  activityTimeline = [
    { icon: '📝', action: 'Posted a new job offer', date: new Date('2024-03-01') },
    { icon: '📥', action: 'Received an application', date: new Date('2024-03-02') },
    { icon: '✅', action: 'Marked an application as reviewed', date: new Date('2024-03-03') },
    { icon: '✉️', action: 'Sent interview invitation', date: new Date('2024-03-04') },
  ];

  profileCompletion = 75;

  // Line Chart: Applications Over Time
  applicationsLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12, 19, 8, 15, 22, 17],
        label: 'Applications',
        fill: true,
        tension: 0.4,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.15)',
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#fff',
        pointRadius: 5,
      }
    ]
  };

  applicationsLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  applicationsLineChartType: ChartType = 'line';

  // Doughnut Chart: Job Offer Status
  statusDoughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Active', 'Draft', 'Inactive'],
    datasets: [
      {
        data: [2, 1, 1],
        backgroundColor: ['#007bff', '#ffc107', '#ff4d4f'],
        borderWidth: 2,
        cutout: '70%' // correct placement
      } as any // workaround to avoid type issues in Chart.js typings
    ]
  };

  statusDoughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  statusDoughnutChartType: ChartType = 'doughnut';

  // Bar Chart: Top Job Offers
  topOffersBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Frontend Dev', 'UX/UI Designer', 'Backend Dev'],
    datasets: [
      {
        data: [25, 18, 0],
        label: 'Applications',
        backgroundColor: '#007bff',
        borderRadius: 8
      }
    ]
  };

  topOffersBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e3f0ff' }
      }
    }
  };

  topOffersBarChartType: ChartType = 'bar';

  constructor(private jobOffersService: JobOffersService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.jobOffersService.getJobOffers().subscribe(offers => {
      this.jobOffers = offers;
      this.totalOffers = offers.length;
      this.activeOffers = offers.filter(o => o.status === 'ACTIVE').length;
      this.totalApplications = offers.reduce((sum, o) => sum + (o.applicationsCount || 0), 0);
      this.topJobOffers = [...offers]
        .sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0))
        .slice(0, 3);
    });
  }
}
