import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [RouterLink, CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit {
  activeTab = 'employer';

  ngOnInit() {
    // Initialize component
    this.setupTabFunctionality();
  }

  setupTabFunctionality() {
    // Add click event listeners for tab buttons
    setTimeout(() => {
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabPanels = document.querySelectorAll('.tab-panel');

      tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const tabName = target.getAttribute('data-tab');
          
          if (tabName) {
            this.switchTab(tabName);
          }
        });
      });
    }, 100);
  }

  switchTab(tabName: string) {
    // Remove active class from all buttons and panels
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Add active class to selected button and panel
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(tabName);

    if (activeButton) activeButton.classList.add('active');
    if (activePanel) activePanel.classList.add('active');

    this.activeTab = tabName;
  }
}
