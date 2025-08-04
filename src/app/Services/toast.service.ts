// src/app/Services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastMessageSubject = new BehaviorSubject<string | null>(null);
  toastMessage$ = this.toastMessageSubject.asObservable();

  show(message: string) {
    this.toastMessageSubject.next(message);
    setTimeout(() => this.toastMessageSubject.next(null), 4000);
  }
}
