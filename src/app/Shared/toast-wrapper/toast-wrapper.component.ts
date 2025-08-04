import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';
import { ToastService } from '../../Services/toast.service';

@Component({
  selector: 'app-toast-wrapper',
  standalone: true,
  imports: [CommonModule, NotificationToastComponent],
  template: `
    <app-notification-toast *ngIf="toastMessage" [message]="toastMessage" />
  `
})
export class ToastWrapperComponent {
  toastMessage: string | null = null;

  constructor(private toastService: ToastService) {
    this.toastService.toastMessage$.subscribe(message => {
      this.toastMessage = message;
    });
  }
}
