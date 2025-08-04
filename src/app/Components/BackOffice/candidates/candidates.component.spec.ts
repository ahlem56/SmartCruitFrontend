import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesBackofficeComponent } from './candidates.component';

describe('CandidatesComponent', () => {
  let component: CandidatesBackofficeComponent;
  let fixture: ComponentFixture<CandidatesBackofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatesBackofficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatesBackofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
