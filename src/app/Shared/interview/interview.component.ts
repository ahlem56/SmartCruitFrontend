import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Interview, InterviewService } from '../../Services/interview.service';
import type { CalendarOptions } from '@fullcalendar/core';

@Component({
  selector: 'app-interview',
  standalone: true,
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css'],
  imports: [CommonModule, DatePipe]
})
export class InterviewComponent implements OnInit, AfterViewInit {
  @ViewChild('calendarHost', { read: ViewContainerRef }) calendarHost!: ViewContainerRef;

  interviews: Interview[] = [];
  calendarEvents: any[] = [];
  calendarOptions!: CalendarOptions;
  calendarRef?: ComponentRef<any>;

  isEmployer = false;
  userId!: number;
  isBrowser: boolean;
  selectedInterview: Interview | null = null;

  constructor(
    public interviewService: InterviewService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user?.userId || !user?.role) return;

    this.userId = user.userId;
    this.isEmployer = user.role === 'employer';

    const fetch$ = this.isEmployer
      ? this.interviewService.getInterviewsForEmployer(this.userId)
      : this.interviewService.getInterviewsForCandidate(this.userId);

    fetch$.subscribe(interviews => {
      this.interviews = interviews;
      this.setupCalendarEvents();
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || !this.calendarHost) return;

    this.loadCalendar();
  }

  private async loadCalendar(): Promise<void> {
    const { FullCalendarComponent } = await import('@fullcalendar/angular');
    const dayGridPlugin = (await import('@fullcalendar/daygrid')).default;
    const timeGridPlugin = (await import('@fullcalendar/timegrid')).default;

    this.calendarRef = this.calendarHost.createComponent(FullCalendarComponent);

    const baseOptions: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      },
      height: 'auto',
      events: this.calendarEvents,
      eventClick: ({ event }) => {
        this.selectedInterview = event.extendedProps as Interview;
      },
      eventContent: ({ event, timeText }) => {
        const interview = event.extendedProps as Interview;
        const status = interview.status;
        const location = interview.location || '';
        const icon = this.getStatusIcon(status);

        return {
          html: `
            <div class="fc-event-custom">
              <div class="fc-event-status">${icon} <strong>${status}</strong></div>
             
            </div>
          `
        };
      }
    };

    this.calendarRef.instance.options = baseOptions;
  }

  private setupCalendarEvents(): void {
    this.calendarEvents = this.interviews.map(interview => {
      const date = new Date(interview.confirmedDate || interview.proposedDate);

      return {
        title: `${interview.status} Interview`,
        start: date,
        end: date,
        backgroundColor: this.getStatusColor(interview.status),
        borderColor: '#ccc',
        extendedProps: interview
      };
    });

    // If calendar already exists, update events live
    if (this.calendarRef?.instance) {
      const api = this.calendarRef.instance.getApi();
      api.removeAllEvents();
      api.addEventSource(this.calendarEvents);
    }
  }

  confirm(interviewId: number): void {
    const interview = this.interviews.find(i => i.interviewId === interviewId);
    const proposedDate = interview?.proposedDate;
  
    if (!proposedDate) return;
  
    this.interviewService.confirmInterview(interviewId, proposedDate).subscribe(updated => {
      this.interviews = this.interviews.map(i =>
        i.interviewId === updated.interviewId ? updated : i
      );
      this.setupCalendarEvents();
      this.closeModal(); // Optional UX improvement
    });
  }
  

  cancel(interviewId: number): void {
    this.interviewService.cancelInterview(interviewId).subscribe(() => {
      this.interviews = this.interviews.map(i =>
        i.interviewId === interviewId ? { ...i, status: 'CANCELLED' } : i
      );
      this.setupCalendarEvents();
    });
  }

  closeModal(): void {
    this.selectedInterview = null;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'PENDING':
      default: return '#ffc107';
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '🟢';
      case 'CANCELLED': return '❌';
      case 'PENDING':
      default: return '🟡';
    }
  }
}
