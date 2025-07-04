import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostJobOffersComponent } from './post-job-offers.component';

describe('PostJobOffersComponent', () => {
  let component: PostJobOffersComponent;
  let fixture: ComponentFixture<PostJobOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostJobOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostJobOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
