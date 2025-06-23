import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      }
    });
  }
}
