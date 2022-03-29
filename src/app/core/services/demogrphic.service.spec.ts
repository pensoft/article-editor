import { TestBed } from '@angular/core/testing';

import { DemogrphicService } from './demogrphic.service';

describe('DemogrphicService', () => {
  let service: DemogrphicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemogrphicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
