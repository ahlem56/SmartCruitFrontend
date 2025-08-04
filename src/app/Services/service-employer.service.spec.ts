import { TestBed } from '@angular/core/testing';

import { ServiceEmployerService } from './service-employer.service';

describe('ServiceEmployerService', () => {
  let service: ServiceEmployerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceEmployerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
