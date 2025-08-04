import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-toast',
  template: `
    <div class="toast" *ngIf="message">
      <p>{{ message }}</p>
    </div>
  `,
  styleUrls: ['./notification-toast.component.css'],
  standalone: true
})
export class NotificationToastComponent {
  @Input() message!: string;
}
