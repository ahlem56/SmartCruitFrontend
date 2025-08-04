import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../Services/support.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,ReactiveFormsModule]
})
export class SupportComponent implements OnInit {
  supportForm!: FormGroup;
  submitted = false;
  attachmentName: string = '';
  attachmentFile: File | null = null;

  faqs = [
    { question: 'How long does it take to get a response?', answer: 'Our team typically responds within 24 hours during business days.', open: false },
    { question: 'Can I attach a screenshot or document?', answer: 'Yes! You can attach images or documents using the attachment field in the form.', open: false },
    { question: 'What if I forgot my password?', answer: 'Use the Forgot Password link on the login page to reset your password.', open: false },
    { question: 'How do I update my profile?', answer: 'Go to your profile page and click the Edit button to update your information.', open: false },
    { question: 'How do I contact support urgently?', answer: 'You can email us at support@smartcruit.com or call +1 234 567 89 for urgent matters.', open: false }
  ];

  constructor(private fb: FormBuilder, private supportService: SupportService) {}

  ngOnInit() {
    this.supportForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.attachmentFile = file;
      this.attachmentName = file.name;
    }
  }

  removeAttachment(): void {
    this.attachmentFile = null;
    this.attachmentName = '';
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  scrollToForm(event: Event): void {
    event.preventDefault();
    document.querySelector('.support-form-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  submitForm(): void {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.entries(this.supportForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (this.attachmentFile) {
      formData.append('attachment', this.attachmentFile);
    }

    this.supportService.submitSupportRequest(formData).subscribe({
      next: () => {
        this.submitted = true;
        this.supportForm.reset();
        this.removeAttachment();
      },
      error: () => alert('Error submitting support request.')
    });
  }

  get f() {
    return this.supportForm.controls;
  }
}
