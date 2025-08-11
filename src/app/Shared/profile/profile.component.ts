import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../../Services/application.service';

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
  userRole: 'candidate' | 'employer' | 'admin' | null = null;
  isAdminViewingAnotherProfile = false;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isHovering = false;
  appliedJobs: any[] = [];
  showApplicationsModal = false;


  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
  const userId = this.route.snapshot.paramMap.get('userId');
  const fetchProfile$ = userId
    ? this.userService.getUserById(userId)
    : this.userService.getProfile();

  this.isAdminViewingAnotherProfile = !!userId;

  fetchProfile$.subscribe({
    next: (data) => {
      this.userProfile = data;
      this.userRole = this.detectUserRole(data);
      this.initForm();

      if (this.userRole === 'candidate' && this.userProfile?.userId) {
        this.loadCandidateApplications(this.userProfile.userId);
      }
    },
    error: (err) => {
      console.error('Error fetching profile:', err);
    }
  });
}

private loadCandidateApplications(candidateId: number): void {
  this.applicationService.getApplicationsByCandidate(candidateId).subscribe({
    next: (apps) => (this.appliedJobs = apps),
    error: (err) => console.error('Failed to load applied jobs:', err)
  });
}


  detectUserRole(user: any): 'candidate' | 'employer' | 'admin' | null {
    if ('preferredJobTitle' in user) return 'candidate';
    if ('industry' in user) return 'employer';
    if ('role' in user && user.role === 'ADMIN') return 'admin';
    return null;
  }

  initForm(): void {
    const role = this.userRole;

    this.profileForm = this.fb.group({
      fullName: [this.userProfile?.fullName || '', Validators.required],
      phoneNumber: [this.userProfile?.phoneNumber || '', Validators.required],
      ...(role === 'candidate' && {
        address: [this.userProfile?.address || '', Validators.required],
        phoneNumber: [this.userProfile?.phoneNumber || '', Validators.required], 
        currentPosition: [this.userProfile?.currentPosition || '', Validators.required],
        preferredJobTitle: [this.userProfile?.preferredJobTitle || '', Validators.required],
        educationLevel: [this.userProfile?.educationLevel || '', Validators.required],
        bio: [this.userProfile?.bio || '', Validators.maxLength(1000)],
        linkedinUrl: [this.userProfile?.linkedinUrl || '', [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)]],
        githubUrl: [this.userProfile?.githubUrl || '', [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.*$/)]],
        portfolioUrl: [this.userProfile?.portfolioUrl || '', [Validators.pattern(/^https?:\/\/.*/)]]
      }),
      ...(role === 'employer' && {
        contact: [this.userProfile?.contact || '', Validators.required],
        phoneNumber: [this.userProfile?.phoneNumber || '', Validators.required], 
        industry: [this.userProfile?.industry || '', Validators.required],
        linkedinUrl: [this.userProfile?.linkedInUrl || '', [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)]],
        githubUrl: [this.userProfile?.githubUrl || '', [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.*$/)]]
      }),
       ...(role === 'admin' && {
          phoneNumber: [this.userProfile?.phoneNumber || '', Validators.required],

      // For admins, only basic editable fields
      // You can expand this later if needed
    })
    });
  }

  toggleEdit(): void {
    if (this.isAdminViewingAnotherProfile) return;
    this.editMode = !this.editMode;
    if (this.editMode && this.userProfile) {
      this.profileForm.patchValue(this.userProfile);
    }
  }

  saveChanges(): void {
    if (this.isAdminViewingAnotherProfile || !this.profileForm.valid) return;

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

  onProfilePicSelected(event: Event): void {
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

    this.userService.uploadProfilePicture(this.userProfile.email, this.selectedFile).subscribe({
      next: () => {
        this.selectedFile = null;
        this.userService.getProfile().subscribe({
          next: (data) => {
            this.userProfile = data;
            this.previewUrl = null;
            this.userService.refreshCurrentUserProfile();
          },
          error: (err) => console.error('Error refreshing profile:', err)
        });
      },
      error: (err) => {
        console.error('Failed to upload profile picture', err);
        alert('Error uploading image. Please try again.');
      }
    });
  }

  cancelProfilePicture(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  openApplicationsModal(): void {
    this.showApplicationsModal = true;
  }
  
  closeApplicationsModal(): void {
    this.showApplicationsModal = false;
  }
  
}
