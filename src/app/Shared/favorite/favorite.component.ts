import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { FavoriteService } from '../../Services/favorite.service';
import { UserService } from '../../Services/user.service';
import { JobOffer } from '../../Services/job-offers.service';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favorites: JobOffer[] = [];
  loading = true;
  error = false;

  constructor(
    private favoriteService: FavoriteService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.favoriteService.getFavoritesByCandidate(user.userId).subscribe({
          next: (data) => {
            this.favorites = data.map(f => f.jobOffer);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.error = true;
          }
        });
      }
    });
  }

  goToJobDetails(id: number): void {
    this.router.navigate([`/job-details/${id}`]);
  }
}
