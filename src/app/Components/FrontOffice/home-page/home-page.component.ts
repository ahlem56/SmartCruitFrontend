import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../../Services/home.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule],
})
export class HomePageComponent implements OnInit, AfterViewInit {

  topCompanies: any[] = [];
  jobCategories: any[] = [];
  featuredJobs: any[] = [];

  stats = {
    jobs: 0,
    companies: 0,
    candidates: 0
  };

  constructor(private homeService: HomeService) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadTopCompanies();
    this.loadCategories();
    this.loadFeaturedJobs();
  }

  loadStats() {
    this.homeService.getStats().subscribe(data => this.stats = data);
  }

  loadTopCompanies() {
    this.homeService.getTopCompanies().subscribe(data => {
      this.topCompanies = data;
  
      // Wait for the DOM to render new elements
      setTimeout(() => this.initScrollAnimations(), 100);
    });
  }
  

  loadCategories() {
    this.homeService.getJobCategories().subscribe(data => {
      this.jobCategories = data;
      setTimeout(() => this.initScrollAnimations(), 100);
    });
  }
  
  loadFeaturedJobs() {
    this.homeService.getFeaturedJobs().subscribe(data => {
      this.featuredJobs = data;
      setTimeout(() => this.initScrollAnimations(), 100);
    });
  }
  

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initCounterAnimations();
  }

  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all cards and sections
    const elements = document.querySelectorAll('.feature-card, .company-card, .category-card, .job-card, .process-step, .testimonial-card');
    elements.forEach(el => observer.observe(el));

    let delay = 0;
elements.forEach((el, index) => {
  el.setAttribute('style', `transition-delay: ${delay}ms`);
  delay += 100;
  observer.observe(el);
});

  }

  initCounterAnimations(): void {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const finalValue = parseInt(target.getAttribute('data-target') || '0');
          this.animateCounter(target, finalValue);
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    // Observe all stat numbers
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    statNumbers.forEach(el => observer.observe(el));
  }

  animateCounter(element: HTMLElement, finalValue: number): void {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOutQuart);
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  getStepIcon(step: number): string {
    const icons = {
      1: 'fas fa-user-plus',
      2: 'fas fa-search',
      3: 'fas fa-rocket'
    };
    return icons[step as keyof typeof icons] || 'fas fa-check';
  }

  getStepTitle(step: number): string {
    const titles = {
      1: 'Create Your Profile',
      2: 'Find Your Match',
      3: 'Land Your Dream Job'
    };
    return titles[step as keyof typeof titles] || 'Step';
  }

  getStepDescription(step: number): string {
    const descriptions = {
      1: 'Build a compelling profile that showcases your skills, experience, and career goals to attract top employers.',
      2: 'Our AI-powered matching system connects you with the perfect job opportunities based on your profile.',
      3: 'Apply with confidence and get hired by leading companies that match your career aspirations.'
    };
    return descriptions[step as keyof typeof descriptions] || 'Complete this step';
  }
}