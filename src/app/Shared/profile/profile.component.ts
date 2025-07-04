import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = null;
  profileForm!: FormGroup;
  editMode = false;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
        this.initForm();
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      fullName: [this.userProfile?.fullName || '', Validators.required],
      phoneNumber: [this.userProfile?.phoneNumber || '', Validators.required],
      address: [this.userProfile?.address || '', Validators.required],
      currentPosition: [this.userProfile?.currentPosition || '', Validators.required],
      preferredJobTitle: [this.userProfile?.preferredJobTitle || '', Validators.required],
      educationLevel: [this.userProfile?.educationLevel || '', Validators.required],
      careerSummary: [this.userProfile?.careerSummary || '', Validators.required],
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.userProfile) {
      this.profileForm.patchValue(this.userProfile);
    }
  }

  saveChanges(): void {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      this.userService.updateProfile(this.userProfile.email, updatedData).subscribe({
        next: () => {
          this.userProfile = { ...this.userProfile, ...updatedData };
          this.editMode = false;
        },
        error: (err) => {
          console.error('Error saving profile:', err);
        }
      });
    }
  }

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  onProfilePicSelected(event: Event): void {
    console.log('Image file selected');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile || !this.userProfile?.email) return;

    console.log('Uploading image for', this.userProfile.email);
    this.userService.uploadProfilePicture(this.userProfile.email, this.selectedFile).subscribe({
      next: () => {
        console.log('Image uploaded. Re-fetching profile...');
        this.selectedFile = null;
      
        this.userService.getProfile().subscribe({
          next: (data) => {
            console.log('Updated profile received:', data);
            this.userProfile = data;
            this.previewUrl = null;
      
            // 🔁 Sync with header
            this.userService.refreshCurrentUserProfile();
          },
          error: (err) => {
            console.error('Error refreshing profile:', err);
          }
        });
      }
      ,
      error: (err) => {
        console.error('Failed to upload profile picture', err);
        alert('Error uploading image. Please try again.');
      }
    });
  }

  cancelProfilePicture(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    console.log('Image selection canceled');
  }
}
