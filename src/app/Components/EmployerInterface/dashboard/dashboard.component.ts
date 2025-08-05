import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { JobOffersService, JobOffer } from '../../../Services/job-offers.service';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartConfiguration } from 'chart.js';
import { ServiceEmployerService } from '../../../Services/service-employer.service';
import { UserService } from '../../../Services/user.service';
import { CandidateService } from '../../../Services/candidate.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  employerId!: number; // dynamique
currentUser: any;
topMatches: { candidateName: string, jobTitle: string, score: number }[] = [];

  applicationsToday = 0;
  applicationsThisWeek = 0;
  applicationsThisMonth = 0;
  upcomingInterviews = 0;
  jobAdPerformance: { jobId: number, views: number, title: string }[] = [];

  jobViewsChartData: any;
jobViewsChartOptions: any;
  funnelChartData: any;
  funnelChartOptions: any;
  totalCandidates = 0;

  totalApplications = 0;
highMatches = 0;
totalJobOffers = 0;
avgProcessingTime = 0;
autoRejectRate = 0;


  // Engagement/Leaderboard Data
  topCandidates: { name: string, avatarUrl: string, count: number }[] = [];
  topJobOffers: { title: string, applicationsCount: number }[] = [];
  upcomingInterviewList: { candidateName: string, date: string }[] = [];
  
  // Charts
  trendsChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [10, 15, 8, 20],
        label: 'Applications',
        fill: true,
        tension: 0.4,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.15)',
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#fff',
        pointRadius: 5
      }
    ]
  };
  trendsChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }
  };
  statusChartData = {
    labels: ['Active', 'Draft', 'Inactive'],
    datasets: [
      {
        data: [5, 2, 1],
        backgroundColor: ['#007bff', '#ffc107', '#ff4d4f'],
        borderWidth: 2
      }
    ]
  };
  statusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const // ✅ FIX: strict literal type
      }
    }
  };
  
  
  

  constructor(private http: HttpClient, private employerService: ServiceEmployerService,  private userService: UserService ,  private candidateService: CandidateService 
) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();
    
    if (this.currentUser?.role === 'employer') {
      this.employerId = this.currentUser.userId;
  
      // Appels API
      this.fetchApplicationsSummary();
      this.fetchUpcomingInterviews();
      this.fetchFunnelData();
      this.fetchKpis();
      this.fetchTopCandidates();
      this.fetchTopJobOffers();
      this.fetchUpcomingInterviewsDetailed();
      this.fetchCandidateCount();
      this.fetchApplicationTrends();
      this.fetchOfferStatus();
      this.fetchTopMatches();
      this.fetchJobAdPerformance();



      
    } else {
      console.warn("User is not an employer or not logged in.");
    }
  }
  

  fetchApplicationsSummary() {
    this.http.get<any>(`http://localhost:8089/SmartCruit/employer/dashboard/applicationsSummary/${this.employerId}`)
      .subscribe(data => {
        this.applicationsToday = data.today;
        this.applicationsThisWeek = data.thisWeek;
        this.applicationsThisMonth = data.thisMonth;
      });
  }

  fetchUpcomingInterviews() {
    this.http.get<number>(`http://localhost:8089/SmartCruit/employer/dashboard/upcomingInterviews/${this.employerId}`)
      .subscribe(count => {
        this.upcomingInterviews = count;
      });
  }

  fetchCandidateCount() {
    this.candidateService.getCandidateCount().subscribe(count => {
      this.totalCandidates = count;
    });
  }
  
  fetchFunnelData() {
    this.http.get<{ [key: string]: number }>(`http://localhost:8089/SmartCruit/employer/dashboard/funnel/${this.employerId}`)
      .subscribe(data => {
        const labels = Object.keys(data);
        const values = Object.values(data);

        this.funnelChartData = {
          labels,
          datasets: [
            {
              label: 'Applications Funnel',
              data: values,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        };

        this.funnelChartOptions = {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Application Stages'
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        };
      });
  }

  fetchKpis() {
    this.employerService.getKpis(this.employerId).subscribe(data => {
        this.totalApplications = data.totalApplications;
        this.highMatches = data.highMatches;
        this.totalJobOffers = data.totalJobOffers;
        this.avgProcessingTime = data.avgProcessingTime;
        this.autoRejectRate = data.autoRejectRate;
      });
  }

  fetchTopCandidates() {
    this.employerService.getTopCandidates(this.employerId).subscribe(data => {
      this.topCandidates = data;
    });
  }
  
  fetchTopJobOffers() {
    this.employerService.getTopJobOffers(this.employerId).subscribe(data => {
      this.topJobOffers = data;
    });
  }
  
  fetchUpcomingInterviewsDetailed() {
    this.employerService.getUpcomingInterviewsDetailed(this.employerId).subscribe(data => {
      this.upcomingInterviewList = data;
    });
  }
  
  get statCards() {
    return [
      {
        label: 'Total Applications',
        context: 'Overall',
        value: this.totalApplications,
        trendText: '',
        trendClass: ''
      },
      {
        label: 'Application Overview',
        context: 'Day Week Month',
        value: '',
        trendText: '',
        trendClass: '',
        groupedStats: [
          { label: 'Today', value: this.applicationsToday },
          { label: 'Week', value: this.applicationsThisWeek },
          { label: 'Month', value: this.applicationsThisMonth }
        ],
        chartData: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [{
            data: [8, 12, 9, this.applicationsThisMonth],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true
          }]
        }
      },
    
   
      {
        label: 'Total Job Offers',
        context: 'Posted',
        value: this.totalJobOffers,
        trendText: '',
        trendClass: ''
      },
      {
        label: 'Total Candidates',
        context: 'Registered',
        value: this.totalCandidates,
        trendText: '',
        trendClass: ''
      },
      
      {
        label: 'Avg Processing Time',
        context: 'Days',
        value: `${this.avgProcessingTime} d`,
        trendText: '',
        trendClass: ''
      }
   
    ];
  }
  
 
  fetchApplicationTrends() {
    this.http.get<{ [week: string]: number }>(`http://localhost:8089/SmartCruit/employer/dashboard/applicationTrends/${this.employerId}`)
      .subscribe(data => {
        const labels = Object.keys(data);
        const values = Object.values(data);
  
        this.trendsChartData = {
          labels,
          datasets: [{
            data: values,
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

  fetchOfferStatus() {
    this.http.get<{ [status: string]: number }>(`http://localhost:8089/SmartCruit/employer/dashboard/offerStatus/${this.employerId}`)
      .subscribe(data => {
        this.statusChartData = {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: ['#007bff', '#ffc107', '#ff4d4f'],
            borderWidth: 2
          }]
        };
      });
  }
  fetchTopMatches() {
    this.employerService.getTopMatches(this.employerId).subscribe(data => {
      this.topMatches = data.slice(0, 3); // ✅ Limit to top 3

    });
  }
  
  
  fetchJobAdPerformance() {
    this.employerService.getJobAdPerformance(this.employerId).subscribe(data => {
      const sorted = data.sort((a, b) => b.views - a.views);
      this.jobAdPerformance = sorted;
  
      this.jobViewsChartData = {
        labels: sorted.map(ad => ad.title.length > 30 ? ad.title.slice(0, 30) + '...' : ad.title),
        datasets: [{
          data: sorted.map(ad => ad.views),
          backgroundColor: sorted.map(() => this.getRandomGradientColor()),
          borderRadius: 10,
          borderSkipped: false,
          hoverBackgroundColor: '#1976d2'
        }]
      };
  
      this.jobViewsChartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Most Viewed Job Offers',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.parsed.x} views`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Views',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            ticks: {
              font: { size: 12 },
              color: '#333'
            }
          }
        }
      };
    });
  }
  
  // Utility function for nice color variety
  getRandomGradientColor(): string {
    const gradients = [
      'linear-gradient(90deg, #42A5F5, #478ED1)',
      'linear-gradient(90deg, #66BB6A, #43A047)',
      'linear-gradient(90deg, #FF7043, #F4511E)',
      'linear-gradient(90deg, #FFA726, #FB8C00)',
      'linear-gradient(90deg, #AB47BC, #8E24AA)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }
  
  
}
