import { TestBed } from '@angular/core/testing';

import { BroadcasterService } from './broadcaster.service';

describe('BroadcasterService', () => {
  let service: BroadcasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BroadcasterService]
    });
    service = TestBed.inject(BroadcasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
