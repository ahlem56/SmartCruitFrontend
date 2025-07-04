import { Component } from '@angular/core';
import { SupportService } from '../../Services/support.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
  imports: [FormsModule,CommonModule]
})
export class SupportComponent {
  supportForm = {
    fullName: '',
    email: '',
    subject: '',
    message: ''
  };

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

  constructor(private supportService: SupportService) {}

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
    const formSection = document.querySelector('.support-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitForm() {
    if (this.validateForm()) {
      const formData = new FormData();
      Object.keys(this.supportForm).forEach(key => {
        formData.append(key, (this.supportForm as any)[key]);
      });
      if (this.attachmentFile) {
        formData.append('attachment', this.attachmentFile);
      }
      this.supportService.submitSupportRequest(formData).subscribe({
        next: () => {
          this.submitted = true;
          this.resetForm();
          this.removeAttachment();
        },
        error: () => {
          alert('Error submitting support request.');
        }
      });
    }
  }

  validateForm(): boolean {
    const { fullName, email, subject, message } = this.supportForm;
    if (!fullName || !email || !subject || !message) {
      alert('All fields are required.');
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.supportForm = {
      fullName: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
