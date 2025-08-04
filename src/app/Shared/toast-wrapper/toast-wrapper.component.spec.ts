import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastWrapperComponent } from './toast-wrapper.component';

describe('ToastWrapperComponent', () => {
  let component: ToastWrapperComponent;
  let fixture: ComponentFixture<ToastWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
