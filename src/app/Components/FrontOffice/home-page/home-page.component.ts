import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.initScrollAnimations();
    }, 100);
  }

  private initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add the animate class to trigger the animation
          entry.target.classList.add('animate');
          
          // Optional: Stop observing after animation is triggered
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-item');
    console.log('Found animated elements:', animatedElements.length); // Debug log
    
    animatedElements.forEach((el, index) => {
      observer.observe(el);
      console.log(`Observing element ${index}:`, el); // Debug log
    });
  }

  // Test method to manually trigger animations
  testAnimations(): void {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-item');
    animatedElements.forEach(el => {
      el.classList.add('animate');
    });
    console.log('Manually triggered animations for', animatedElements.length, 'elements');
  }
}
