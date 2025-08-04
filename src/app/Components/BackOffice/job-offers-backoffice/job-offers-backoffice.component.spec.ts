import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOffersBackofficeComponent } from './job-offers-backoffice.component';

describe('JobOffersBackofficeComponent', () => {
  let component: JobOffersBackofficeComponent;
  let fixture: ComponentFixture<JobOffersBackofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOffersBackofficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOffersBackofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
